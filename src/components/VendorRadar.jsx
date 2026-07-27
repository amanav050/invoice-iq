import { useState } from 'react'
import { vendors as initialVendors, vendorFallbacks, formatCurrency } from '../data'
import StatusPill from './StatusPill'
import ScoreBar from './ScoreBar'
import SummaryBar from './SummaryBar'
import VendorDetail from './VendorDetail'

export default function VendorRadar({ showToast }) {
  const [vendors, setVendors] = useState(initialVendors)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)

  const selected = vendors.find((v) => v.id === selectedId)
  const flagged = vendors.filter((v) => v.reliability < 50).length
  const exposure = vendors.filter((v) => v.reliability < 70).reduce((s, v) => s + v.invoiceCount * 50000, 0)

  const summaryItems = [
    { label: 'Monitored', value: vendors.length, accent: 'blue', icon: 'vendors' },
    { label: 'High-risk', value: flagged, accent: 'amber', icon: 'issues' },
    { label: 'ITC exposure', value: formatCurrency(exposure), accent: 'red', icon: 'risk' },
  ]

  async function handleSelect(id) {
    setSelectedId(id)
    const v = vendors.find((x) => x.id === id)
    if (v.analysis) return

    setLoading(true)
    let analysis = null

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'vendor', data: { name: v.name, gstin: v.gstin, reliability: v.reliability, filingStatus: v.filingStatus, invoiceCount: v.invoiceCount, riskNote: v.riskNote } }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (res.ok) {
        const data = await res.json()
        if (data && data.riskNarrative) analysis = data
      }
    } catch {}

    if (!analysis) {
      await new Promise((r) => setTimeout(r, 1200))
      analysis = vendorFallbacks[id] || vendorFallbacks['V002']
    }

    setVendors((p) => p.map((x) => (x.id === id ? { ...x, analysis } : x)))
    setLoading(false)
  }

  return (
    <div className="pt-6">
      <SummaryBar items={summaryItems} />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className={`w-full ${selectedId ? 'lg:w-[56%]' : ''} transition-all duration-300`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vendors.map((v) => (
              <button key={v.id} onClick={() => handleSelect(v.id)}
                className={`text-left card-interactive p-5 ${selectedId === v.id ? '!border-accent/25 glow-sm' : ''}`}>
                <div className="flex items-start justify-between mb-3.5">
                  <div>
                    <p className="text-[13px] font-semibold text-text">{v.name}</p>
                    <p className="text-[11px] text-muted font-mono mt-1 tracking-wide">{v.gstin}</p>
                  </div>
                  <StatusPill label={v.riskLevel} />
                </div>
                <div className="mb-3.5"><ScoreBar score={v.reliability} /></div>
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                  <StatusPill label={v.filingStatus} />
                  <span className="text-[11px] text-muted">{v.invoiceCount} invoices</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedId && (
          <div className="hidden lg:block w-[44%] animate-[fadeSlideIn_0.3s_ease-out]">
            <div className="sticky top-[76px]">
              <VendorDetail vendor={selected} loading={loading} onClose={() => setSelectedId(null)} />
            </div>
          </div>
        )}

        {selectedId && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col animate-[fadeIn_0.2s]">
            <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
            <div className="bg-base-light border-t border-white/[0.08] rounded-t-2xl max-h-[85vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]">
              <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full bg-white/10" /></div>
              <VendorDetail vendor={selected} loading={loading} onClose={() => setSelectedId(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}