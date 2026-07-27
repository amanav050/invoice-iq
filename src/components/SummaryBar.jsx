const icons = {
  analyzed: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6 9.5L8 11.5L12 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  issues: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2.5L16 15H2L9 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M9 7.5V10.5M9 12.5H9.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  risk: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M9 5.5V9L11.5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  vendors: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="12" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 15C2 12.5 4 11 6.5 11C7.5 11 8.4 11.3 9 11.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M10 15C10 12.5 10.5 11 12 11C14.5 11 16 12.5 16 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
}

const accents = {
  blue: { border: 'border-accent/20', icon: 'text-accent bg-accent/10', value: 'text-text-bright' },
  amber: { border: 'border-warning/20', icon: 'text-warning bg-warning/10', value: 'text-warning' },
  red: { border: 'border-danger/20', icon: 'text-danger bg-danger/10', value: 'text-danger' },
  green: { border: 'border-success/20', icon: 'text-success bg-success/10', value: 'text-success' },
}

export default function SummaryBar({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
      {items.map((item, i) => {
        const a = accents[item.accent] || accents.blue
        return (
          <div key={i} className={`card px-5 py-4 flex items-center gap-4 ${a.border}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.icon}`}>
              {icons[item.icon] || icons.analyzed}
            </div>
            <div>
              <p className="label mb-1">{item.label}</p>
              <p className={`text-[22px] font-semibold tracking-tight ${a.value}`}>{item.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}