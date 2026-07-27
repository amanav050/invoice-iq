import { useEffect, useState } from 'react'

function getStyle(s) {
  if (s >= 71) return { bar: 'from-success to-emerald-400', text: 'text-success', glow: 'rgba(16,185,129,0.2)' }
  if (s >= 41) return { bar: 'from-warning to-amber-400', text: 'text-warning', glow: 'rgba(245,158,11,0.2)' }
  return { bar: 'from-danger to-red-400', text: 'text-danger', glow: 'rgba(239,68,68,0.2)' }
}

export default function ScoreBar({ score }) {
  const [w, setW] = useState(0)
  const s = getStyle(score)

  useEffect(() => {
    const t = setTimeout(() => setW(score), 150)
    return () => clearTimeout(t)
  }, [score])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="label">Reliability</span>
        <span className={`text-sm font-semibold ${s.text}`}>{score}<span className="text-muted text-xs font-normal">/100</span></span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/[0.04]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${s.bar} transition-all duration-1000 ease-out`}
          style={{ width: `${w}%`, boxShadow: w > 0 ? `0 0 12px ${s.glow}` : 'none' }}
        />
      </div>
    </div>
  )
}