export default function LoginScreen({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-accent/[0.06] blur-[150px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[130px] animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue/[0.03] blur-[100px]" />

      <div className="relative w-full max-w-[480px] animate-[fadeIn_0.8s_ease-out]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent via-purple-500 to-accent-light mb-6 shadow-xl shadow-accent/25">
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

        <div className="frosted rounded-2xl p-7 shadow-2xl shadow-black/20">
          <h2 className="text-lg font-semibold text-text-bright mb-2">
            Instant GST compliance checks
          </h2>
          <p className="text-sm text-muted-light mb-8 leading-relaxed">
            Scan any invoice for HSN mismatches, incorrect tax rates, and ITC risks — powered by AI that understands Indian GST law.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => onLogin('demo')}
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/25 text-white"
            >
              See demo dashboard
            </button>

            <button
              onClick={() => onLogin('scan')}
              className="w-full py-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] text-text-secondary hover:text-text text-sm font-medium transition-all duration-300"
            >
              Scan an invoice now <span className="ml-1.5 text-accent">→</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8">
          <div className="text-center">
            <p className="text-xl font-bold text-text-bright">5,000+</p>
            <p className="text-[10px] text-muted mt-0.5">HSN codes covered</p>
          </div>
          <div className="w-px h-8 bg-white/[0.06]" />
          <div className="text-center">
            <p className="text-xl font-bold text-text-bright">&lt;3s</p>
            <p className="text-[10px] text-muted mt-0.5">Analysis time</p>
          </div>
          <div className="w-px h-8 bg-white/[0.06]" />
          <div className="text-center">
            <p className="text-xl font-bold text-text-bright">100%</p>
            <p className="text-[10px] text-muted mt-0.5">GST Act coverage</p>
          </div>
        </div>
      </div>
    </div>
  )
}