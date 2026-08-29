import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  BookOpen,
  ShieldCheck
} from 'lucide-react';

export const LoginView = () => {
  const { login, loading, authError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    await login(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-between text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Header Area */}
      <div className="pt-10 pb-4 px-4 text-center">
        <div className="inline-flex items-center justify-center p-3.5 bg-amber-500/10 border border-amber-400/30 rounded-2xl mb-4 shadow-xl">
          <BookOpen className="w-9 h-9 text-amber-400" />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide text-white font-serif uppercase drop-shadow-md">
          ANLOGA DISTRICT RHEMA FULL GOSPEL CHURCHES
        </h1>
        <h2 className="text-base sm:text-xl font-bold tracking-widest text-amber-400 font-serif uppercase mt-1">
          MONTHLY REPORT
        </h2>
        <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-lg mx-auto font-sans">
          Authorized Reporting Portal for Secretaries, Pastors & District Administration
        </p>
      </div>

      {/* Centered Secure Login Card */}
      <div className="max-w-md mx-auto w-full px-4 py-4">
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-9 border border-slate-200">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Secure Authentication Portal</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-serif">Sign In to Your Account</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your assigned username and password to access your dashboard.
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
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
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
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Need account assistance? Contact your <strong>District Administrator</strong>.
            </p>
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
