import { useEffect, useState } from 'react'

function getColor(score) {
  if (score >= 71) return { main: '#10B981', glow: 'rgba(16,185,129,0.15)' }
  if (score >= 41) return { main: '#F59E0B', glow: 'rgba(245,158,11,0.15)' }
  return { main: '#EF4444', glow: 'rgba(239,68,68,0.15)' }
}

function getLabel(score) {
  if (score >= 90) return 'Excellent'
  if (score >= 71) return 'Good'
  if (score >= 41) return 'Needs review'
  return 'Critical'
}

export default function ComplianceGauge({ score }) {
  const [val, setVal] = useState(0)
  const { main, glow } = getColor(score)
  const r = 50
  const circ = 2 * Math.PI * r
  const offset = circ - (val / 100) * circ

  useEffect(() => {
    const t = setTimeout(() => setVal(score), 200)
    return () => clearTimeout(t)
  }, [score])

  return (
    <div className="flex flex-col items-center py-5">
      <div className="relative w-[136px] h-[136px]">
        {/* Glow */}
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 40px ${glow}`, transition: 'box-shadow 1s ease' }} />
        <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90">
          <circle cx="68" cy="68" r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="7" />
          <circle
            cx="68" cy="68" r={r} fill="none"
            stroke={main} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[32px] font-bold tracking-tight" style={{ color: main }}>{val}</span>
          <span className="text-[10px] font-medium text-muted-light tracking-wide mt-0.5">{getLabel(score)}</span>
        </div>
      </div>
    </div>
  )
}