import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const isOk = type === 'success'

  return (
    <div className="fixed top-5 right-5 z-50 animate-[slideDown_0.4s_ease-out]">
      <div className={`
        frosted rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl shadow-black/30
        ${isOk ? 'border-success/20' : 'border-danger/20'}
      `}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isOk ? 'bg-success/10' : 'bg-danger/10'}`}>
          {isOk ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7.5L5.5 10L11 4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="#EF4444" strokeWidth="1.5"/><path d="M7 4.5V7.5M7 9.5H7.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
          )}
        </div>
        <span className="text-sm font-medium text-text">{message}</span>
        <button onClick={onClose} className="text-muted hover:text-text transition-colors ml-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
  )
}