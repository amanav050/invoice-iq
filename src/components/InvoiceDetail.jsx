import ComplianceGauge from './ComplianceGauge'
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

export default function InvoiceDetail({ invoice, loading, onApplyFix, onClose }) {
  const a = invoice?.analysis

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div>
          <p className="text-[11px] text-muted font-mono tracking-wide">{invoice?.id}</p>
          <p className="text-sm font-semibold text-text-bright mt-0.5">{invoice?.vendorName}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="#4B5574" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      {loading || !a ? <SkeletonBlock /> : (
        <div className="p-5 space-y-3">
          <ComplianceGauge score={a.complianceScore} />

          <Row label="HSN code validation">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-text bg-white/[0.04] px-2.5 py-1 rounded-lg">{a.hsnValidation?.current || invoice.hsnCode}</code>
                {!a.hsnValidation?.isValid && (<><span className="text-muted text-xs">→</span><code className="text-sm font-mono text-success bg-success/10 px-2.5 py-1 rounded-lg">{a.hsnValidation?.correct}</code></>)}
              </div>
              <StatusPill label={a.hsnValidation?.isValid ? 'Valid' : 'Mismatch'} />
            </div>
            <p className="text-xs text-muted-light leading-relaxed">{a.hsnValidation?.reason}</p>
          </Row>

          <Row label="ITC eligibility">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-text-secondary leading-relaxed">{a.itcEligibility?.reason}</p>
              <StatusPill label={a.itcEligibility?.status || 'Unknown'} />
            </div>
          </Row>

          <Row label="Tax rate check">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-text-bright">{a.taxRateCheck?.applied}%</p>
                  <p className="text-[9px] label mt-0.5">Applied</p>
                </div>
                <div className="w-px h-8 bg-white/[0.06]" />
                <div className="text-center">
                  <p className="text-lg font-bold text-text-bright">{a.taxRateCheck?.correct}%</p>
                  <p className="text-[9px] label mt-0.5">Correct</p>
                </div>
              </div>
              <StatusPill label={a.taxRateCheck?.isValid ? 'Correct' : 'Mismatch'} />
            </div>
          </Row>

          {a.recommendation && (
            <div className="bg-accent/[0.04] border border-accent/10 rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent mb-1.5">Recommendation</p>
              <p className="text-xs text-text-secondary leading-relaxed">{a.recommendation}</p>
            </div>
          )}

          {a.complianceScore < 100 && (
            <button onClick={onApplyFix}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-accent to-accent-light text-white hover:shadow-lg hover:shadow-accent/20">
              Apply fix
            </button>
          )}
        </div>
      )}
    </div>
  )
}