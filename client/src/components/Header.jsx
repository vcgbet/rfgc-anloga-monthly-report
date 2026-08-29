import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  Key, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  ChevronDown,
  Sparkles,
  Layers
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

export const Header = () => {
  const { user, logout, switchUserDirect } = useAuth();
  const { isConnected, refreshAll, usersList } = useSync();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Admin Tier
          </span>
        );
      case 'pastor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
            <UserCheck className="w-3.5 h-3.5 text-blue-700" /> Pastor Tier
          </span>
        );
      case 'secretary':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Building2 className="w-3.5 h-3.5 text-emerald-700" /> Secretary Tier
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="bg-[#1e3a8a] text-white shadow-md border-b-4 border-[#b45309]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Branding Header */}
            <div className="text-center md:text-left">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-white uppercase font-serif drop-shadow-sm">
                ANLOGA DISTRICT RHEMA FULL GOSPEL CHURCHES
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-0.5">
                <span className="text-xs sm:text-sm font-semibold tracking-widest text-amber-300 uppercase">
                  MONTHLY REPORT
                </span>
                <span className="text-blue-300 text-xs">•</span>
                <span className="text-blue-200 text-xs font-medium">Digital Portal & Synced Records</span>
              </div>
            </div>

            {/* User Session & Quick Actions */}
            {user && (
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3">
                {/* Real-Time Sync Indicator */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    isConnected
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-950/60 text-red-300 border-red-500/40'
                  }`}
                  title={isConnected ? 'Connected to real-time sync server' : 'Reconnecting...'}
                >
                  {isConnected ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <Wifi className="w-3 h-3" />
                      <span>Live Synced</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <WifiOff className="w-3 h-3" />
                      <span>Offline / Reconnecting</span>
                    </>
                  )}
                </div>

                {/* Role Switcher Menu for fast testing */}
                <div className="relative">
                  <button
                    onClick={() => setShowSwitcher(!showSwitcher)}
                    className="inline-flex items-center gap-1.5 bg-blue-900/80 hover:bg-blue-800 text-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-700/60 transition shadow-sm"
                    title="Quick switch role for instant demonstration"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-300" />
                    <span>Switch Tier</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showSwitcher && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-1">
                      <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        ⚡ Fast Switch Role (Demo)
                      </div>
                      
                      {/* Admin Option */}
                      <button
                        onClick={() => {
                          const adminUser = usersList.find(u => u.role === 'admin') || {
                            id: 'user-admin',
                            role: 'admin',
                            name: 'District Administrator',
                            username: 'admin',
                            branchName: 'District Headquarters'
                          };
                          switchUserDirect(adminUser);
                          setShowSwitcher(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-amber-100 text-amber-800 font-bold">ADM</span>
                          <div>
                            <p className="font-semibold text-slate-800">Admin Dashboard</p>
                            <p className="text-[10px] text-slate-500">Full District Control</p>
                          </div>
                        </div>
                      </button>

                      {/* Pastor Option */}
                      <button
                        onClick={() => {
                          const pastorUser = usersList.find(u => u.username === 'pastor.chapel.4') || 
                            usersList.find(u => u.role === 'pastor') || {
                              id: 'user-pastor-genui',
                              role: 'pastor',
                              name: 'Pastor Victor C. Gbetodeme',
                              branchName: 'GENUI – LOVE CHAPEL',
                              username: 'pastor.chapel.4'
                            };
                          switchUserDirect(pastorUser);
                          setShowSwitcher(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-blue-100 text-blue-800 font-bold">PAS</span>
                          <div>
                            <p className="font-semibold text-slate-800">Pastor Victor (Genui)</p>
                            <p className="text-[10px] text-slate-500">Review, Edit & Endorsement</p>
                          </div>
                        </div>
                      </button>

                      {/* Secretary Option */}
                      <button
                        onClick={() => {
                          const secUser = usersList.find(u => u.username === 'doris') || 
                            usersList.find(u => u.role === 'secretary') || {
                              id: 'user-sec-genui',
                              role: 'secretary',
                              name: 'Doris Tetteh',
                              branchName: 'GENUI – LOVE CHAPEL',
                              username: 'doris'
                            };
                          switchUserDirect(secUser);
                          setShowSwitcher(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-emerald-100 text-emerald-800 font-bold">SEC</span>
                          <div>
                            <p className="font-semibold text-slate-800">Doris Tetteh (Secretary)</p>
                            <p className="text-[10px] text-slate-500">Create & Submit Reports</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* User Pill Card */}
                <div className="flex items-center gap-2 bg-blue-950/70 border border-blue-800/80 rounded-lg px-3 py-1 text-xs">
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-white leading-tight">{user.name}</p>
                    <p className="text-[11px] text-blue-200">{user.branchName || 'District HQ'}</p>
                  </div>
                  {getRoleBadge(user.role)}
                </div>

                {/* Password / Actions */}
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition"
                  title="Change Password"
                >
                  <Key className="w-4 h-4" />
                </button>

                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1 bg-red-800/80 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Toast Notification Banners */}
      <ToastContainer />

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
};

const ToastContainer = () => {
  const { notifications, removeNotification } = useSync();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border text-xs font-medium flex items-start justify-between gap-3 animate-in fade-in slide-in-from-right-4 transition-all ${
            n.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700 shadow-emerald-900/30'
              : n.type === 'warning'
              ? 'bg-amber-900 text-amber-100 border-amber-700 shadow-amber-900/30'
              : 'bg-slate-900 text-slate-100 border-slate-700 shadow-slate-900/30'
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5">⚡</span>
            <div>
              <p className="leading-snug">{n.message}</p>
              <span className="text-[10px] opacity-70 mt-1 block">{n.timestamp}</span>
            </div>
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="text-slate-300 hover:text-white text-sm leading-none px-1"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};
