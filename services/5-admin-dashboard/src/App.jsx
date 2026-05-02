import { useState } from 'react'

function App() {
  const [token, setToken] = useState('');
  const [secureData, setSecureData] = useState(null);
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const AUTH_URL = import.meta.env.VITE_AUTH_URL || '/api/auth';
  const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || '/api/v1';
  const handleLogin = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'cybersec2026' })
      });
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        setError('');
      } else {
        setError('Login failed. Invalid credentials.');
      }
    } catch (err) {
      setError('Auth service unreachable. Check network proxy.');
    }
    setIsFetching(false);
  };

  const fetchSecureData = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/v1/secure-data/confidential', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403 || response.status === 401) {
        setError('Access Denied: Gateway intercepted unauthorized request.');
        setSecureData(null);
      } else {
        const data = await response.json();
        setSecureData(data);
        setError('');
      }
    } catch (err) {
      setError('Gateway unreachable. Connection timed out.');
    }
    setIsFetching(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans selection:bg-cyan-500/30">
      {/* Header Section */}
      <header className="mb-12 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          {/* Shield Icon */}
          <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Zero-Trust <span className="text-cyan-400">Gateway</span></h1>
        </div>
        <p className="text-slate-400 font-medium tracking-wide text-sm uppercase">Security Operations Center • Live Dashboard</p>
      </header>

      {/* Main Grid Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Controls & Authentication */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Decorative Top Border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-500 to-blue-600"></div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Identity Provider (IdP)
            </h2>
            
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
              <span className="text-sm font-semibold text-slate-400">Current Session</span>
              {token ? (
                <span className="flex items-center gap-2 text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Authenticated
                </span>
              ) : (
                <span className="flex items-center gap-2 text-xs font-bold px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span> Unauthorized
                </span>
              )}
            </div>

            <button 
              onClick={handleLogin}
              disabled={isFetching}
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)] disabled:opacity-50"
            >
              Request Access Token (JWT)
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-teal-600"></div>
             <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
              Backend Resource
            </h2>
             <button 
              onClick={fetchSecureData}
              disabled={isFetching}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50"
            >
              Access Secure Vault
            </button>
          </div>
        </div>

        {/* Right Column: Terminal Output */}
        <div className="bg-[#0a0e17] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-125">
          {/* Terminal Header */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <span className="text-xs font-mono text-slate-500">gateway_logs.sh</span>
          </div>
          
          {/* Terminal Body */}
          <div className="p-6 font-mono text-sm overflow-y-auto flex-1">
            <div className="text-slate-500 mb-4">&gt; Awaiting connection...</div>
            
            {error && (
              <div className="text-rose-400 mb-4 p-3 bg-rose-500/10 border-l-2 border-rose-500">
                [SEC_ALERT] {error}
              </div>
            )}

            {secureData && (
              <div className="text-emerald-400">
                <div className="mb-2 text-emerald-300">[{new Date().toLocaleTimeString()}] 200 OK - Gateway passed proxy request.</div>
                <pre className="mt-4 p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg overflow-x-auto shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] text-emerald-300 leading-relaxed">
                  {JSON.stringify(secureData, null, 2)}
                </pre>
              </div>
            )}
            
            {isFetching && (
              <div className="text-cyan-400 animate-pulse mt-4">
                &gt; Negotiating TLS handshake...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default App