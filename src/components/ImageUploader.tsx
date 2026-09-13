import { useRef, useState } from 'react'
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

type Props = {
  value: string
  onChange: (url: string) => void
  folder: 'food' | 'drinks' | 'rooms' | 'gallery' | 'staff'
  label?: string
}

export default function ImageUploader({ value, onChange, folder, label = 'Image' }: Props) {
  const { push } = useToast()
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { push('Image must be under 5MB', 'error'); return }
    setUploading(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve((r.result as string).split(',')[1])
        r.onerror = reject
        r.readAsDataURL(file)
      })
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type, folder }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      onChange(data.url)
      push('Image uploaded', 'success')
    } catch (e) {
      push(e instanceof Error ? e.message : 'Upload failed', 'error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-earth">{label}</label>
      <div className="mt-2 flex gap-3">
        {/* Preview */}
        <div className="w-24 h-24 rounded-xl bg-cream border border-forest/10 grid place-items-center overflow-hidden shrink-0">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          ) : (
            <ImageIcon className="w-6 h-6 text-earth/50" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          {/* URL input */}
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... or upload below"
            className="w-full px-3 py-2 rounded-lg bg-white border border-forest/10 focus:border-forest outline-none text-xs"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex-1 px-3 py-2 rounded-lg bg-forest text-cream text-xs font-semibold hover:bg-forest-deep transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? 'Uploading…' : 'Upload from device'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3 py-2 rounded-lg bg-clay/10 text-clay text-xs font-semibold hover:bg-clay/20 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }}
          />
        </div>
      </div>
    </div>
  )
}
