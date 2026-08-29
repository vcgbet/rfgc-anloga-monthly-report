import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const LoginView = () => {
  const { login, loading, authError } = useAuth();
  const { usersList, branches } = useSync();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('admin'); // 'admin', 'pastor', 'secretary'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    await login(username, password);
  };

  const handleQuickSelect = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  const handleAutoLogin = async (u, p) => {
    setUsername(u);
    setPassword(p);
    await login(u, p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-between text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Header Area */}
      <div className="pt-8 pb-4 px-4 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 border border-amber-400/30 rounded-2xl mb-4 shadow-lg">
          <BookOpen className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide text-white font-serif uppercase drop-shadow-md">
          ANLOGA DISTRICT RHEMA FULL GOSPEL CHURCHES
        </h1>
        <h2 className="text-base sm:text-xl font-bold tracking-widest text-amber-400 font-serif uppercase mt-1">
          MONTHLY REPORT
        </h2>
        <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-xl mx-auto font-sans">
          Real-Time Cross-Device Synced Reporting Portal for Secretaries, Pastors & District Administration
        </p>
      </div>

      {/* Main Login Card Area */}
      <div className="max-w-4xl mx-auto w-full px-4 py-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left / Login Form */}
        <div className="md:col-span-6 bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 font-serif">Sign In to Your Tier</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select your role or enter credentials to access your dashboard.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p>{authError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin, doris, pastor.chapel.4"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </form>

          {/* Quick Demo Fill hint */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Default Admin: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-blue-900">admin</code> / <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-blue-900">password123</code>
            </p>
          </div>
        </div>

        {/* Right / Quick Role & Login Details Picker */}
        <div className="md:col-span-6 bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700 text-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Official Login Directory</span>
            </h4>
            <span className="text-[10px] bg-blue-950 px-2 py-0.5 rounded text-blue-300 border border-blue-800">
              PDF Synced
            </span>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl mb-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
            <button
              onClick={() => setActiveTab('pastor')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'pastor'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Pastors (6)
            </button>
            <button
              onClick={() => setActiveTab('secretary')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'secretary'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Secretaries (6)
            </button>
          </div>

          {/* Tab contents */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {activeTab === 'admin' && (
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">District Administrator</p>
                  <p className="text-[11px] text-amber-300">All District Branches & Governance</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    User: <strong className="text-white">admin</strong> | Pass: <strong className="text-white">password123</strong>
                  </p>
                </div>
                <button
                  onClick={() => handleAutoLogin('admin', 'password123')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow"
                >
                  Sign In
                </button>
              </div>
            )}

            {activeTab === 'pastor' && (
              <>
                {[
                  { name: 'Pastor Victor C. Gbetodeme', branch: 'Genui – Love Chapel', u: 'pastor.chapel.4', p: 'Rf@6AEDF221' },
                  { name: 'Rev. Reuben Afadzinu', branch: 'Agbledomi', u: 'pastor.agbledomi.21', p: 'Rf@69D60B22' },
                  { name: 'Pastor Wisdom Amudzi', branch: 'Agorve', u: 'pastor.agorve.2', p: 'Rf@808F7F91' },
                  { name: 'Rev. John Kugbadzor', branch: 'Biwater – Dominion Center', u: 'pastor.c.3', p: 'Rf@C17CDD66' },
                  { name: 'Rev. Wisdom Fiaador', branch: 'Kportorgbe', u: 'pastor.kportorgbe.5', p: 'Rf@00523606' },
                  { name: 'Rev. Godwin Ayekple', branch: 'Whuti – Salvation Centre', u: 'pastor.ce.6', p: 'Rf@23AA24D4' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between hover:border-blue-500/50 transition text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-[11px] text-blue-300">{item.branch}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        User: <strong className="text-slate-200">{item.u}</strong> | Pass: <strong className="text-slate-200">{item.p}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => handleAutoLogin(item.u, item.p)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition"
                    >
                      Login
                    </button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'secretary' && (
              <>
                {[
                  { name: 'Doris Tetteh', branch: 'Genui – Love Chapel', u: 'doris', p: 'dorist' },
                  { name: 'Emmanuel Apeke', branch: 'Agbledomi', u: 'sec.agbledomi', p: 'secretagb' },
                  { name: 'Emmanuel M. C. Agbakpe', branch: 'Agorve', u: 'secretary.agorve', p: 'agorve@secreta#' },
                  { name: 'Pastor Hope Ahadzi', branch: 'Biwater', u: 'secretary.biw', p: 'bi-wat@secretary' },
                  { name: 'Moses Tettey', branch: 'Kportorgbe', u: 'm.kportorgbe', p: 'kport@sec.1' },
                  { name: 'Rita Sitsofe Dzakah', branch: 'Whuti – Salvation Centre', u: 'sec.whuti.ce', p: 'salva@whuti2' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between hover:border-emerald-500/50 transition text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-[11px] text-emerald-300">{item.branch}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        User: <strong className="text-slate-200">{item.u}</strong> | Pass: <strong className="text-slate-200">{item.p}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => handleAutoLogin(item.u, item.p)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition"
                    >
                      Login
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Footer Required */}
      <div className="bg-slate-950 text-slate-400 border-t border-slate-800 py-4 px-4 text-center text-xs space-y-1">
        <p className="font-serif tracking-wide text-slate-300">
          ANLOGA DISTRICT RHEMA FULL GOSPEL CHURCHES — MONTHLY REPORT
        </p>
        <p className="text-amber-400 font-medium">
          Developed by <span className="font-semibold text-white">V. C. Gbetodeme</span> | Contact:{' '}
          <a href="tel:0243302919" className="underline hover:text-white font-semibold">
            0243302919
          </a>
        </p>
      </div>
    </div>
  );
};
