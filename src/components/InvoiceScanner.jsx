import { useState } from 'react'
import { invoices as initialInvoices, formatCurrency } from '../data'
import StatusPill from './StatusPill'
import SummaryBar from './SummaryBar'
import InvoiceDetail from './InvoiceDetail'

export default function InvoiceScanner({ showToast }) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanningAll, setScanningAll] = useState(false)

  const selected = invoices.find((i) => i.id === selectedId)
  const analyzedCount = invoices.filter((i) => i.status === 'analyzed').length
  const issuesFound = invoices.filter((i) => i.analysis && i.analysis.complianceScore < 80).length
  const itcAtRisk = invoices
    .filter((i) => i.analysis && i.analysis.itcEligibility?.status !== 'eligible')
    .reduce((s, i) => s + i.amount * (i.gstRate / 100), 0)

  const summaryItems = [
    { label: 'Analyzed', value: `${analyzedCount} / ${invoices.length}`, accent: 'blue', icon: 'analyzed' },
    { label: 'Issues found', value: issuesFound, accent: 'amber', icon: 'issues' },
    { label: 'ITC at risk', value: itcAtRisk > 0 ? formatCurrency(itcAtRisk) : '₹0', accent: 'red', icon: 'risk' },
  ]

  async function analyzeOne(id) {
    const inv = invoices.find((i) => i.id === id)
    if (inv.analysis) return true
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'invoice', data: { invoiceNumber: inv.id, vendorName: inv.vendorName, amount: inv.amount, hsnCode: inv.hsnCode, gstRate: inv.gstRate, date: inv.date, vendorFilingStatus: inv.vendorFilingStatus } }),
      })
      if (!res.ok) throw new Error()
      const analysis = await res.json()
      setInvoices((p) => p.map((i) => (i.id === id ? { ...i, analysis, status: 'analyzed' } : i)))
      return true
    } catch { return false }
  }

  async function handleSelect(id) {
    setSelectedId(id)
    const inv = invoices.find((i) => i.id === id)
    if (inv.analysis) return
    setLoading(true)
    const ok = await analyzeOne(id)
    if (!ok) showToast('Analysis unavailable — try again', 'error')
    setLoading(false)
  }

  async function handleScanAll() {
    setScanningAll(true)
    const pending = invoices.filter((i) => i.status !== 'analyzed')
    let failed = 0
    for (const inv of pending) {
      const ok = await analyzeOne(inv.id)
      if (!ok) failed++
      await new Promise((r) => setTimeout(r, 3000))
    }
    setScanningAll(false)
    if (failed) showToast(`${pending.length - failed} done, ${failed} failed`, 'error')
    else showToast(`All ${pending.length} invoices analyzed`)
  }

  function handleApplyFix(id) {
    showToast('Compliance fix applied')
    setInvoices((p) => p.map((i) => i.id === id && i.analysis ? { ...i, analysis: { ...i.analysis, complianceScore: 100 } } : i))
  }

  const pendingCount = invoices.filter((i) => i.status !== 'analyzed').length

  return (
    <div className="pt-6">
      <SummaryBar items={summaryItems} />

      {/* Banner */}
      <div className="card px-5 py-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/8 flex items-center justify-center shrink-0 text-accent">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4H14M2 8H14M2 12H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p className="text-[13px] font-medium text-text">
              {pendingCount > 0 ? `${pendingCount} invoice${pendingCount > 1 ? 's' : ''} from Mar–Apr 2025 pending review` : 'All invoices analyzed'}
            </p>
            <p className="text-[11px] text-muted mt-0.5">Source: GSTR-1 & Purchase Register</p>
          </div>
        </div>
        {pendingCount > 0 && (
          <button onClick={handleScanAll} disabled={scanningAll}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-30 bg-gradient-to-r from-accent to-accent-light text-white hover:shadow-lg hover:shadow-accent/20">
            {scanningAll ? (<><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Scanning...</>) : 'Analyze All'}
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Table */}
        <div className={`w-full ${selectedId ? 'lg:w-[56%]' : ''} transition-all duration-300`}>
          <div className="card overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.04]">
              <span className="label">Invoice / vendor</span>
              <span className="label text-right w-24">Amount</span>
              <span className="label text-right w-20">HSN / GST</span>
              <span className="label text-right w-24">Status</span>
            </div>

            {invoices.map((inv, idx) => {
              const score = inv.analysis?.complianceScore
              const isActive = selectedId === inv.id
              const scoreColor = score >= 71 ? 'bg-success/10 text-success border-success/20' : score >= 41 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-danger/10 text-danger border-danger/20'

              return (
                <button key={inv.id} onClick={() => handleSelect(inv.id)}
                  className={`w-full text-left px-5 py-3.5 flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:items-center gap-2 sm:gap-4 transition-all duration-200 border-b border-white/[0.03] last:border-0 ${isActive ? 'bg-accent/[0.05] border-l-2 !border-l-accent' : 'hover:bg-white/[0.02]'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${inv.status === 'analyzed' ? scoreColor : 'bg-white/[0.02] text-muted border-white/[0.06]'}`}>
                      {inv.status === 'analyzed' ? score : idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-text truncate">{inv.vendorName}</p>
                      <p className="text-[11px] text-muted mt-0.5">{inv.id} · {inv.date}</p>
                    </div>
                  </div>
                  <p className="text-[13px] font-semibold text-text sm:text-right w-24">{formatCurrency(inv.amount)}</p>
                  <p className="text-[11px] text-muted-light sm:text-right w-20">{inv.hsnCode} · {inv.gstRate}%</p>
                  <div className="sm:flex sm:justify-end w-24"><StatusPill label={inv.status === 'analyzed' ? 'Analyzed' : 'Pending Review'} /></div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Desktop detail */}
        {selectedId && (
          <div className="hidden lg:block w-[44%] animate-[fadeSlideIn_0.3s_ease-out]">
            <div className="sticky top-[76px]">
              <InvoiceDetail invoice={selected} loading={loading} onApplyFix={() => handleApplyFix(selectedId)} onClose={() => setSelectedId(null)} />
            </div>
          </div>
        )}

        {/* Mobile sheet */}
        {selectedId && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col animate-[fadeIn_0.2s]">
            <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
            <div className="bg-base-light border-t border-white/[0.08] rounded-t-2xl max-h-[85vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]">
              <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full bg-white/10" /></div>
              <InvoiceDetail invoice={selected} loading={loading} onApplyFix={() => handleApplyFix(selectedId)} onClose={() => setSelectedId(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}