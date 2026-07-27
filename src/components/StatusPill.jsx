const config = {
  'Pending Review': { bg: 'bg-white/[0.04]', text: 'text-muted-light', dot: 'bg-muted-light' },
  'Analyzed': { bg: 'bg-success/8', text: 'text-success', dot: 'bg-success' },
  'Regular': { bg: 'bg-success/8', text: 'text-success', dot: 'bg-success' },
  'Irregular': { bg: 'bg-warning/8', text: 'text-warning', dot: 'bg-warning' },
  'Defaulter': { bg: 'bg-danger/8', text: 'text-danger', dot: 'bg-danger' },
  'Low': { bg: 'bg-success/8', text: 'text-success', dot: 'bg-success' },
  'Medium': { bg: 'bg-warning/8', text: 'text-warning', dot: 'bg-warning' },
  'High': { bg: 'bg-danger/8', text: 'text-danger', dot: 'bg-danger' },
  'Critical': { bg: 'bg-danger/8', text: 'text-danger', dot: 'bg-danger' },
  'eligible': { bg: 'bg-success/8', text: 'text-success', dot: 'bg-success' },
  'at-risk': { bg: 'bg-warning/8', text: 'text-warning', dot: 'bg-warning' },
  'blocked': { bg: 'bg-danger/8', text: 'text-danger', dot: 'bg-danger' },
  'Valid': { bg: 'bg-success/8', text: 'text-success', dot: 'bg-success' },
  'Mismatch': { bg: 'bg-danger/8', text: 'text-danger', dot: 'bg-danger' },
  'Correct': { bg: 'bg-success/8', text: 'text-success', dot: 'bg-success' },
}

export default function StatusPill({ label }) {
  const c = config[label] || config['Pending Review']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide ${c.bg} ${c.text}`}>
      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
      {label}
    </span>
  )
}