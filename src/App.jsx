import { useState } from 'react'
import LoginScreen from './components/LoginScreen'
import Header from './components/Header'
import InvoiceScanner from './components/InvoiceScanner'
import VendorRadar from './components/VendorRadar'
import Toast from './components/Toast'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [entryMode, setEntryMode] = useState('demo')
  const [activeTab, setActiveTab] = useState('invoices')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  function handleLogin(mode) {
    setEntryMode(mode)
    setLoggedIn(true)
  }

  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setLoggedIn(false)} />
        <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {activeTab === 'invoices' ? (
            <InvoiceScanner showToast={showToast} entryMode={entryMode} />
          ) : (
            <VendorRadar showToast={showToast} />
          )}
        </main>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}