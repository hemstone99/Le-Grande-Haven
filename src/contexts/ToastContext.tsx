import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react'

type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' }
const ToastCtx = createContext<{ push: (message: string, type?: Toast['type']) => void }>({ push: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200)
  }, [])
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div key={t.id} className="animate-fade-up glass border border-forest/10 rounded-2xl px-4 py-3 shadow-2xl flex items-start gap-3">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-forest shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-clay shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-ocean shrink-0 mt-0.5" />}
            <div className="text-sm text-forest-deep flex-1">{t.message}</div>
            <button onClick={() => setToasts(x => x.filter(y => y.id !== t.id))} className="text-forest/40 hover:text-forest"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
