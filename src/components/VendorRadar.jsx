import { useState } from 'react'
import { vendors as initialVendors, vendorFallbacks, formatCurrency } from '../data'
import StatusPill from './StatusPill'
import ScoreBar from './ScoreBar'
import SummaryBar from './SummaryBar'
import VendorDetail from './VendorDetail'

function generateVendorFallback(data) {
  const reliability = parseInt(data.reliability) || 50
  const invoiceCount = parseInt(data.invoiceCount) || 1
  const filingStatus = data.filingStatus
  const exposureAmt = invoiceCount * 50000

  let riskNarrative, filingPattern, prediction, recommendation

  if (filingStatus === 'Defaulter') {
    riskNarrative = data.name + ' represents critical compliance risk. No recent GSTR-1 filings detected. ITC claims against this vendor face near-certain reversal under Section 16(2)(c). Immediate action required.'
    filingPattern = 'Multiple consecutive GSTR-1 filings missed. GSTIN may be at risk of suo moto cancellation by tax authority.'
    prediction = 'Near-certain ITC denial for all pending and future invoices. Historical claims may also face review.'
    recommendation = 'Immediately cease all transactions. File proactive ITC reversal to avoid interest and penalty. Source alternative vendor with Regular filing status.'
  } else if (filingStatus === 'Irregular') {
    riskNarrative = data.name + ' shows moderate compliance risk with inconsistent GST filing behavior. Late or missed filings indicate operational strain that could escalate to non-compliance.'
    filingPattern = 'Intermittent late filings detected in recent months. Pattern suggests end-of-quarter pressure on compliance processes.'
    prediction = 'Moderate probability of escalation. May transition to Defaulter status within 2-3 months if pattern continues.'
    recommendation = 'Place on watchlist with monthly compliance reviews. Request GSTR-3B acknowledgment before processing large invoices. Establish backup vendor.'
  } else {
    riskNarrative = data.name + ' is a low-risk vendor with consistent GST compliance. Filing record shows regular and timely submissions. No immediate concerns detected.'
    filingPattern = 'GSTR-1 and GSTR-3B returns filed consistently on or before due dates. No late filings in recent history.'
    prediction = 'Minimal risk of compliance issues. Vendor demonstrates strong financial governance and systematic tax processes.'
    recommendation = 'Maintain current transaction levels. Standard quarterly monitoring sufficient. Consider for preferred vendor status.'
  }

  return {
    riskNarrative: riskNarrative,
    filingPattern: filingPattern,
    itcExposure: formatCurrency(exposureAmt),
    prediction: prediction,
    recommendation: recommendation,
  }
}

export default function VendorRadar({ showToast }) {
  const [vendors, setVendors] = useState(initialVendors)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [scanning, setScanning] = useState(false)

  const [form, setForm] = useState({
    name: '', gstin: '', reliability: '50', filingStatus: 'Regular', invoiceCount: '1', riskNote: '',
  })

  const selected = vendors.find((v) => v.id === selectedId)
  const flagged = vendors.filter((v) => v.reliability < 50).length
  const exposure = vendors.filter((v) => v.reliability < 70).reduce((s, v) => s + v.invoiceCount * 50000, 0)

  const summaryItems = [
    { label: 'Monitored', value: vendors.length, accent: 'blue', icon: 'vendors' },
    { label: 'High-risk', value: flagged, accent: 'amber', icon: 'issues' },
    { label: 'ITC exposure', value: formatCurrency(exposure), accent: 'red', icon: 'risk' },
  ]

  function updateForm(key, value) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  function getRiskLevel(reliability, filingStatus) {
    if (filingStatus === 'Defaulter') return 'Critical'
    if (reliability < 40) return 'High'
    if (reliability < 70 || filingStatus === 'Irregular') return 'Medium'
    return 'Low'
  }

  async function handleScanVendor(e) {
    e.preventDefault()
    if (!form.name) return

    setScanning(true)

    const vendorId = 'V-' + Date.now().toString().slice(-6)
    const reliability = parseInt(form.reliability) || 50
    const invoiceCount = parseInt(form.invoiceCount) || 1
    const riskLevel = getRiskLevel(reliability, form.filingStatus)
    const riskNote = form.riskNote || (form.filingStatus === 'Defaulter' ? 'No recent GSTR-1 filings' : form.filingStatus === 'Irregular' ? 'Late filings detected' : 'Consistent filer')

    const newVendor = {
      id: vendorId, name: form.name,
      gstin: form.gstin || 'Not provided',
      reliability: reliability, filingStatus: form.filingStatus,
      invoiceCount: invoiceCount, riskLevel: riskLevel,
      riskNote: riskNote, isDemo: false, analysis: null,
    }

    setVendors((p) => [newVendor, ...p])
    setSelectedId(vendorId)
    setLoading(true)

    let analysis = null

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'vendor', data: {
          name: form.name, gstin: form.gstin || 'Not provided',
          reliability: reliability, filingStatus: form.filingStatus,
          invoiceCount: invoiceCount, riskNote: riskNote,
        }}),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (res.ok) {
        const data = await res.json()
        if (data && data.riskNarrative) analysis = data
      }
    } catch {}

    if (!analysis) {
      await new Promise((r) => setTimeout(r, 1500))
      analysis = generateVendorFallback({
        name: form.name, reliability: reliability,
        filingStatus: form.filingStatus, invoiceCount: invoiceCount,
      })
    }

    setVendors((p) => p.map((v) => (v.id === vendorId ? { ...v, analysis } : v)))
    showToast('Vendor assessed successfully')
    setLoading(false)
    setScanning(false)
    setForm({ name: '', gstin: '', reliability: '50', filingStatus: 'Regular', invoiceCount: '1', riskNote: '' })
  }

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
      analysis = vendorFallbacks[id] || generateVendorFallback({ name: v.name, reliability: v.reliability, filingStatus: v.filingStatus, invoiceCount: v.invoiceCount })
    }

    setVendors((p) => p.map((x) => (x.id === id ? { ...x, analysis } : x)))
    setLoading(false)
  }

  return (
    <div className="pt-6">
      <SummaryBar items={summaryItems} />

      {/* Scan Vendor Form */}
      <div className="card mb-4 overflow-hidden">
        <button onClick={() => setShowForm(!showForm)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-text">Assess a new vendor</p>
              <p className="text-[11px] text-muted mt-0.5">Enter vendor details for instant AI risk assessment</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            className={`text-muted transition-transform duration-300 ${showForm ? 'rotate-180' : ''}`}>
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {showForm && (
          <form onSubmit={handleScanVendor} className="px-5 pb-5 pt-1 border-t border-white/[0.04] animate-[fadeIn_0.2s_ease-out]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              <div>
                <label className="label block mb-1.5">Vendor name</label>
                <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="Vendor name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-text placeholder-muted text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/10 transition-all" />
              </div>
              <div>
                <label className="label block mb-1.5">GSTIN (optional)</label>
                <input type="text" value={form.gstin} onChange={(e) => updateForm('gstin', e.target.value.toUpperCase())}
                  placeholder="15-digit GSTIN" maxLength={15}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-text placeholder-muted text-sm font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/10 transition-all" />
              </div>
              <div>
                <label className="label block mb-1.5">Filing status</label>
                <select value={form.filingStatus} onChange={(e) => updateForm('filingStatus', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-text text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/10 transition-all appearance-none">
                  <option value="Regular" className="bg-surface">Regular</option>
                  <option value="Irregular" className="bg-surface">Irregular</option>
                  <option value="Defaulter" className="bg-surface">Defaulter</option>
                </select>
              </div>
              <div>
                <label className="label block mb-1.5">Reliability score (0-100)</label>
                <input type="number" value={form.reliability} onChange={(e) => updateForm('reliability', e.target.value)}
                  min="0" max="100" placeholder="0-100"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-text placeholder-muted text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/10 transition-all" />
              </div>
              <div>
                <label className="label block mb-1.5">Invoices with you</label>
                <input type="number" value={form.invoiceCount} onChange={(e) => updateForm('invoiceCount', e.target.value)}
                  min="1" placeholder="Number of invoices"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-text placeholder-muted text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/10 transition-all" />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={!form.name || scanning}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-accent to-accent-light text-white hover:shadow-lg hover:shadow-accent/20">
                  {scanning ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Assessing...
                    </span>
                  ) : 'Assess Risk'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className={`w-full ${selectedId ? 'lg:w-[56%]' : ''} transition-all duration-300`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vendors.map((v) => (
              <button key={v.id} onClick={() => handleSelect(v.id)}
                className={`text-left card-interactive p-5 ${selectedId === v.id ? '!border-accent/25 glow-sm' : ''}`}>
                <div className="flex items-start justify-between mb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-text">{v.name}</p>
                      {v.isDemo && <span className="text-[9px] font-medium text-muted bg-white/[0.04] px-1.5 py-0.5 rounded">SAMPLE</span>}
                    </div>
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