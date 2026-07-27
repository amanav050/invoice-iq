export default function Header({ activeTab, setActiveTab, onLogout }) {
  const tabs = [
    { id: 'invoices', label: 'Invoice Scanner', shortLabel: 'Invoices' },
    { id: 'vendors', label: 'Vendor Radar', shortLabel: 'Vendors' },
  ]

  return (
    <header className="sticky top-0 z-40 frosted">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-lg shadow-accent/15">
              <span className="text-[10px] font-black text-white tracking-tight">IQ</span>
            </div>
            <span className="text-[15px] font-semibold text-text-bright hidden sm:block">
              Invoice<span className="gradient-text">IQ</span>
            </span>
          </div>

          {/* Tabs */}
          <nav className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 sm:px-5 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-300
                  ${activeTab === tab.id
                    ? 'bg-accent/10 text-accent shadow-sm'
                    : 'text-muted-light hover:text-text'
                  }
                `}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </nav>

          {/* Status */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-light">
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-success animate-pulse-ring" />
              </div>
              Connected
            </div>
            <button onClick={onLogout} className="text-xs text-muted hover:text-text-secondary transition-colors duration-200">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}