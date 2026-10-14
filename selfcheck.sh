#!/bin/sh
# Boots the server on a spare port and probes it — run via cPanel "Run JS script" → selfcheck
PORT=3999 node server.js > /tmp/lgh-selfcheck.log 2>&1 &
PID=$!
sleep 6
echo "health: $(curl -s localhost:3999/health)"
echo "rooms:  $(curl -s localhost:3999/api/rooms | head -c 120)"
echo "staff (no login, expect 401): $(curl -s -o /dev/null -w '%{http_code}' localhost:3999/api/staff)"
echo "home page: $(curl -s -o /dev/null -w '%{http_code}' localhost:3999/)"
node -e "import('sharp').then(s=>console.log('sharp:', s.default.versions.sharp)).catch(e=>console.log('sharp unavailable:', e.message))"
kill $PID
