import { useState } from 'react'

export default function LoginScreen({ onLogin }) {
  const [gstin, setGstin] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin() }, 1200)
  }

  function handleDemo() {
    setGstin('07AABCS1234M1Z5')
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin() }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-accent/[0.06] blur-[150px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[130px] animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue/[0.03] blur-[100px]" />

      <div className="relative w-full max-w-[420px] animate-[fadeIn_0.8s_ease-out]">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent via-purple-500 to-accent-light mb-6 shadow-xl shadow-accent/25 animate-[fadeIn_0.6s_ease-out]">
            <span className="text-2xl font-black text-white tracking-tight">IQ</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-text-bright">Invoice</span><span className="gradient-text">IQ</span>
          </h1>
          <p className="text-sm text-muted-light mt-3 leading-relaxed">
            AI-powered GST compliance intelligence
          </p>
          <div className="flex items-center justify-center gap-2.5 mt-4">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-success" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-pulse-ring" />
            </div>
            <span className="text-xs text-muted-light font-medium">Powered by Masters India</span>
          </div>
        </div>

        {/* Card */}
        <div className="frosted rounded-2xl p-7 shadow-2xl shadow-black/20">
          <h2 className="text-lg font-semibold text-text-bright mb-1">Connect your GST account</h2>
          <p className="text-sm text-muted-light mb-7">
            Enter your GSTIN to pull invoices and run AI compliance checks
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label block mb-2.5">GSTIN Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="e.g. 07AABCS1234M1Z5"
                maxLength={15}
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-text placeholder-muted text-sm font-mono tracking-widest focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={gstin.length < 5 || loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/25 text-white"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Fetching invoices...
                </span>
              ) : 'Connect & Analyze'}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-surface/60 text-xs text-muted font-medium">or</span>
            </div>
          </div>

          <button
            onClick={handleDemo}
            className="w-full py-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] text-text-secondary hover:text-text text-sm font-medium transition-all duration-300"
          >
            Try with sample data
            <span className="ml-1.5 text-accent">→</span>
          </button>
        </div>

        <p className="text-center text-[11px] text-muted mt-7">
          Your GSTIN is used only to fetch public filing data from GSTN
        </p>
      </div>
    </div>
  )
}