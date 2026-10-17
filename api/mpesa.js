import crypto from 'node:crypto';
import { query, queryOne, uuid } from './db.js';

/**
 * M-Pesa STK push (Lipa na M-Pesa Online) for room-booking deposits.
 *
 *   GET  /api/mpesa/config     { stk }                → whether prompts are switched on
 *   POST /api/mpesa/stk        { booking_id, phone }  → sends the PIN prompt
 *   GET  /api/mpesa/status?id= { status, receipt? }   → polled by the booking form
 *   POST /api/mpesa/callback   ← Safaricom posts the result here
 *   POST /api/mpesa/reference  { booking_id, code }   → manual till payment code
 *
 * Credentials come from the environment (never commit them — the repo is public):
 *   MPESA_STK_ENABLED       false hides/blocks prompts    (default true)
 *   MPESA_ENV               sandbox | production         (default sandbox)
 *   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY
 *   MPESA_SHORTCODE         paybill / store number used to sign the request
 *   MPESA_TRANSACTION_TYPE  CustomerPayBillOnline (default) | CustomerBuyGoodsOnline
 *   MPESA_PARTY_B           receiving number — the till for Buy Goods (default: shortcode)
 *   MPESA_CALLBACK_URL      optional; defaults to https://<this host>/api/mpesa/callback
 */

const env = (k, d = '') => process.env[k] || d;
const BASE = () => (env('MPESA_ENV', 'sandbox') === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke');

// MPESA_STK_ENABLED=false switches prompts off (credentials can stay in place)
export const mpesaConfigured = () =>
  env('MPESA_STK_ENABLED', 'true') !== 'false' &&
  Boolean(env('MPESA_CONSUMER_KEY') && env('MPESA_CONSUMER_SECRET') && env('MPESA_PASSKEY') && env('MPESA_SHORTCODE'));

// Safaricom doesn't sign callbacks, so the callback URL carries a token derived
// from our secret; anything posted without it is ignored.
const callbackToken = () => crypto.createHash('sha256').update('lgh-mpesa:' + env('MPESA_CONSUMER_SECRET')).digest('hex').slice(0, 32);

let tokenCache = { value: '', expires: 0 };
async function accessToken() {
  if (tokenCache.value && Date.now() < tokenCache.expires) return tokenCache.value;
  const auth = Buffer.from(`${env('MPESA_CONSUMER_KEY')}:${env('MPESA_CONSUMER_SECRET')}`).toString('base64');
  const res = await fetch(`${BASE()}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${auth}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error('M-Pesa authentication failed');
  tokenCache = { value: data.access_token, expires: Date.now() + (Number(data.expires_in || 3599) - 60) * 1000 };
  return tokenCache.value;
}

// Daraja wants the timestamp in Kenyan time: YYYYMMDDHHmmss
function signature() {
  const timestamp = new Date(Date.now() + 3 * 3600 * 1000).toISOString().replace(/[-T:]/g, '').slice(0, 14);
  const password = Buffer.from(env('MPESA_SHORTCODE') + env('MPESA_PASSKEY') + timestamp).toString('base64');
  return { timestamp, password };
}

async function daraja(path, body) {
  const res = await fetch(`${BASE()}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, data: await res.json().catch(() => ({})) };
}

// 0712 345 678 / +254712345678 / 254712345678 / 712345678 → 254712345678
export function normalisePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  const local = digits.replace(/^(254|0)/, '');
  return /^[17]\d{8}$/.test(local) ? `254${local}` : null;
}

const nightsBetween = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));

async function bookingWithDeposit(id) {
  const b = await queryOne(
    `SELECT b.id, b.status, b.check_in, b.check_out, r.price_per_night
       FROM bookings b JOIN rooms r ON r.id = b.room_id WHERE b.id = ?`, [id]);
  if (!b) return null;
  // Same sum the booking form shows: 50% of the stay, whole shillings
  return { ...b, deposit: Math.round((Number(b.price_per_night) * nightsBetween(b.check_in, b.check_out)) / 2) };
}

const note = (bookingId, line) =>
  query("UPDATE bookings SET special_requests = CONCAT_WS('\\n', ?, special_requests) WHERE id = ?", [line, bookingId]);

async function stk(req, res) {
  if (!mpesaConfigured()) return res.status(503).json({ error: 'M-Pesa prompts are not available right now — please pay to the till number instead' });
  const { booking_id, phone } = req.body || {};
  const msisdn = normalisePhone(phone);
  if (!msisdn) return res.status(400).json({ error: 'Enter a valid Safaricom number, e.g. 0712 345 678' });
  const booking = booking_id && await bookingWithDeposit(booking_id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status !== 'pending') return res.status(409).json({ error: 'This booking is no longer awaiting payment' });
  if (await queryOne("SELECT id FROM mpesa_payments WHERE booking_id = ? AND status = 'paid'", [booking_id])) {
    return res.status(409).json({ error: 'The deposit for this booking has already been paid' });
  }
  // Each prompt rings someone's phone — cap retries per booking
  const { n } = await queryOne('SELECT COUNT(*) AS n FROM mpesa_payments WHERE booking_id = ? AND created_at > NOW() - INTERVAL 15 MINUTE', [booking_id]);
  if (n >= 3) return res.status(429).json({ error: 'Too many payment prompts — please wait a few minutes or pay to the till number' });

  const shortcode = env('MPESA_SHORTCODE');
  const callback = env('MPESA_CALLBACK_URL') || `${req.protocol}://${req.get('host')}/api/mpesa/callback`;
  const { timestamp, password } = signature();
  const { ok, data } = await daraja('/mpesa/stkpush/v1/processrequest', {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: env('MPESA_TRANSACTION_TYPE', 'CustomerPayBillOnline'),
    Amount: booking.deposit,
    PartyA: msisdn,
    PartyB: env('MPESA_PARTY_B', shortcode),
    PhoneNumber: msisdn,
    CallBackURL: `${callback}${callback.includes('?') ? '&' : '?'}token=${callbackToken()}`,
    AccountReference: `LGH-${String(booking_id).slice(0, 6).toUpperCase()}`,
    TransactionDesc: 'Room deposit',
  });
  if (!ok || data.ResponseCode !== '0') {
    console.error('[mpesa] STK push rejected:', data);
    return res.status(502).json({ error: data.errorMessage || data.ResponseDescription || 'M-Pesa could not send the prompt — please try again' });
  }
  await query(
    `INSERT INTO mpesa_payments (id, booking_id, checkout_request_id, merchant_request_id, phone, amount, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [uuid(), booking_id, data.CheckoutRequestID, data.MerchantRequestID, msisdn, booking.deposit]);
  return res.status(200).json({ checkout_id: data.CheckoutRequestID, amount: booking.deposit, message: data.CustomerMessage });
}

async function markPaid(payment, receipt) {
  await query("UPDATE mpesa_payments SET status = 'paid', receipt = ?, result_code = 0 WHERE id = ? AND status <> 'paid'", [receipt || null, payment.id]);
  await note(payment.booking_id,
    `[M-PESA PAID] Deposit KSh ${Number(payment.amount).toLocaleString('en-KE')} | Receipt: ${receipt || 'pending — check M-Pesa statement'} | Phone: ${payment.phone}`);
}

async function callback(req, res) {
  // Always 200 so Safaricom doesn't retry; ignore anything we can't match
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  if (req.query.token !== callbackToken()) return console.warn('[mpesa] callback with bad token ignored');
  const cb = req.body?.Body?.stkCallback;
  if (!cb?.CheckoutRequestID) return;
  const payment = await queryOne('SELECT * FROM mpesa_payments WHERE checkout_request_id = ?', [cb.CheckoutRequestID]);
  if (!payment || payment.status === 'paid') return;
  if (Number(cb.ResultCode) === 0) {
    const item = (name) => cb.CallbackMetadata?.Item?.find(i => i.Name === name)?.Value;
    await markPaid(payment, item('MpesaReceiptNumber'));
  } else {
    await query("UPDATE mpesa_payments SET status = 'failed', result_code = ?, result_desc = ? WHERE id = ?", [cb.ResultCode, cb.ResultDesc || null, payment.id]);
  }
}

// Friendlier wording for the common STK result codes
const RESULT_TEXT = {
  1: 'Your M-Pesa balance is too low for this payment.',
  1032: 'The payment was cancelled on your phone.',
  1037: 'Your phone didn’t respond in time — make sure it’s on and unlocked, then try again.',
  2001: 'The M-Pesa PIN entered was wrong.',
};

async function status(req, res) {
  // Age measured by MySQL itself, so server and database clocks/timezones can't disagree
  const payment = await queryOne('SELECT *, TIMESTAMPDIFF(SECOND, created_at, NOW()) AS age FROM mpesa_payments WHERE checkout_request_id = ?', [req.query.id]);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  // No callback after ~25s (e.g. callback URL unreachable)? Ask Daraja directly.
  if (payment.status === 'pending' && payment.age > 25 && mpesaConfigured()) {
    const { timestamp, password } = signature();
    const { data } = await daraja('/mpesa/stkpushquery/v1/query', {
      BusinessShortCode: env('MPESA_SHORTCODE'), Password: password, Timestamp: timestamp, CheckoutRequestID: payment.checkout_request_id,
    }).catch(() => ({ data: {} }));
    if (data.ResultCode !== undefined) {
      if (Number(data.ResultCode) === 0) { await markPaid(payment, null); payment.status = 'paid'; }
      else {
        await query("UPDATE mpesa_payments SET status = 'failed', result_code = ?, result_desc = ? WHERE id = ? AND status = 'pending'", [data.ResultCode, data.ResultDesc || null, payment.id]);
        Object.assign(payment, { status: 'failed', result_code: data.ResultCode, result_desc: data.ResultDesc });
      }
    }
  }
  const fresh = payment.status === 'paid' ? await queryOne('SELECT * FROM mpesa_payments WHERE id = ?', [payment.id]) : payment;
  return res.status(200).json({
    status: fresh.status,
    receipt: fresh.receipt || null,
    amount: Number(fresh.amount),
    message: fresh.status === 'failed' ? (RESULT_TEXT[fresh.result_code] || fresh.result_desc || 'The payment didn’t go through.') : null,
  });
}

// Guest paid to the till by hand after the booking was created (e.g. prompt failed)
async function reference(req, res) {
  const { booking_id, code } = req.body || {};
  const clean = String(code || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{8,12}$/.test(clean)) return res.status(400).json({ error: 'Enter the 10-character M-Pesa confirmation code, e.g. QGH7X4K2LM' });
  const booking = booking_id && await queryOne('SELECT id, status FROM bookings WHERE id = ?', [booking_id]);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status !== 'pending') return res.status(409).json({ error: 'This booking is no longer awaiting payment' });
  await note(booking_id, `[PAYMENT] Paid to till manually | M-Pesa code: ${clean} (verify on statement)`);
  return res.status(200).json({ ok: true });
}

export default async function handler(req, res) {
  const action = req.params?.action;
  try {
    if (action === 'config' && req.method === 'GET') return res.status(200).json({ stk: mpesaConfigured() });
    if (action === 'stk' && req.method === 'POST') return await stk(req, res);
    if (action === 'status' && req.method === 'GET') return await status(req, res);
    if (action === 'callback' && req.method === 'POST') return await callback(req, res);
    if (action === 'reference' && req.method === 'POST') return await reference(req, res);
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('[mpesa]', err);
    if (!res.headersSent) res.status(500).json({ error: 'M-Pesa is unavailable right now — please pay to the till number instead' });
  }
}
