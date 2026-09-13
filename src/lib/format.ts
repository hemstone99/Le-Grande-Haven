export const KSH = (n: number | string | null | undefined) => {
  const num = typeof n === 'string' ? parseFloat(n) : (n ?? 0)
  if (!isFinite(num as number)) return 'KSh 0'
  return 'KSh ' + (num as number).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export const formatDate = (iso: string | Date) => {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatDateTime = (iso: string | Date) => {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const daysBetween = (a: string, b: string) => {
  const d1 = new Date(a).getTime()
  const d2 = new Date(b).getTime()
  return Math.max(1, Math.round((d2 - d1) / 86400000))
}

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
