import { useState } from 'react'

function App() {
  const [token, setToken] = useState('');
  const [secureData, setSecureData] = useState(null);
  const [error, setError] = useState('');

  // Simulating logging into the Auth Provider
  const handleLogin = async () => {
    try {
      // In production, this points to your Auth Provider URL
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'cybersec2026' })
      });
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        setError('');
      } else {
        setError('Login failed');
      }
    } catch (err) {
      setError('Auth service unreachable. Is it running?');
    }
  };

  // Simulating fetching data through the Zero-Trust Gateway
  const fetchSecureData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/secure-data/confidential', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403 || response.status === 401) {
        setError('Access Denied by Gateway. Invalid Token.');
        setSecureData(null);
      } else {
        const data = await response.json();
        setSecureData(data);
        setError('');
      }
    } catch (err) {
      setError('Gateway unreachable.');
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-400">Zero-Trust Command Center</h1>
        <p className="text-gray-400 mt-2">Enterprise Security Dashboard</p>
      </header>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-full max-w-2xl border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            1. Authenticate (Get JWT)
          </button>
          <span className="text-sm text-gray-400">
            Status: {token ? <span className="text-green-400">Authenticated</span> : <span className="text-red-400">Unauthenticated</span>}
          </span>
        </div>

        <button 
            onClick={fetchSecureData}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded transition-colors mb-4"
          >
            2. Access Secure Vault via Gateway
        </button>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded mb-4">
            🚨 {error}
          </div>
        )}

        {secureData && (
          <div className="bg-slate-900 p-4 rounded border border-emerald-500/30">
            <h3 className="text-emerald-400 font-bold mb-2">✅ Gateway Permitted Access</h3>
            <pre className="text-sm text-gray-300 overflow-x-auto">
              {JSON.stringify(secureData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default App