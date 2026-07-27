import ScoreBar from './ScoreBar'
import StatusPill from './StatusPill'
import { SkeletonBlock } from './Skeleton'

function Row({ label, children }) {
  return (
    <div className="card-inner p-4">
      <p className="label mb-2.5">{label}</p>
      {children}
    </div>
  )
}

export default function VendorDetail({ vendor, loading, onClose }) {
  const a = vendor?.analysis
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div>
          <div className="flex items-center gap-2.5">
            <p className="text-sm font-semibold text-text-bright">{vendor?.name}</p>
            <StatusPill label={vendor?.riskLevel} />
          </div>
          <p className="text-[11px] text-muted font-mono mt-1 tracking-wide">{vendor?.gstin}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="#4B5574" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      {loading || !a ? <SkeletonBlock /> : (
        <div className="p-5 space-y-3">
          <ScoreBar score={vendor.reliability} />
          <Row label="Risk assessment"><p className="text-sm text-text-secondary leading-relaxed">{a.riskNarrative}</p></Row>
          <Row label="Filing pattern"><p className="text-sm text-text-secondary leading-relaxed">{a.filingPattern}</p></Row>
          <Row label="ITC exposure"><p className="text-xl font-bold text-danger">{a.itcExposure}</p></Row>
          <Row label="Risk prediction"><p className="text-sm text-text-secondary leading-relaxed">{a.prediction}</p></Row>
          {a.recommendation && (
            <div className="bg-accent/[0.04] border border-accent/10 rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent mb-1.5">Recommendation</p>
              <p className="text-xs text-text-secondary leading-relaxed">{a.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}