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
  ChevronDown,
  Layers
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import RFGC_LOGO from '../assets/logo';

export const Header = () => {
  const { user, logout, switchUserDirect, isAdmin } = useAuth();
  const { isConnected, usersList } = useSync();
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
      <header className="bg-[#0F1E36] text-white shadow-md border-b-4 border-amber-500 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Branding Header with Real RFGC Logo */}
            <div className="flex items-center gap-3 text-center md:text-left">
              <img
                src={RFGC_LOGO}
                alt="RFGC Official Logo"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white p-0.5 shadow-md object-contain border-2 border-amber-400 shrink-0"
              />
              <div>
                <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-wide text-white uppercase font-serif drop-shadow-sm">
                  ANLOGA DISTRICT RHEMA FULL GOSPEL CHURCHES
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-0.5">
                  <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                    MONTHLY REPORT
                  </span>
                  <span className="text-blue-300 text-xs">•</span>
                  <span className="text-blue-200 text-xs font-medium">Digital Portal & Synced Records</span>
                </div>
              </div>
            </div>

            {/* User Session & Actions */}
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

                {/* Role Switcher (ONLY for Admin users for inspection / testing) */}
                {isAdmin && (
                  <div className="relative">
                    <button
                      onClick={() => setShowSwitcher(!showSwitcher)}
                      className="inline-flex items-center gap-1.5 bg-blue-900/80 hover:bg-blue-800 text-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-700/60 transition shadow-sm"
                      title="Admin Inspector: View tier as Pastor or Secretary"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-300" />
                      <span>Inspect Tier</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showSwitcher && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-1">
                        <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          🔒 Admin Tier Switcher
                        </div>
                        
                        <button
                          onClick={() => {
                            const pastorUser = usersList.find(u => u.username === 'pastor.chapel.4') || 
                              usersList.find(u => u.role === 'pastor');
                            if (pastorUser) switchUserDirect(pastorUser);
                            setShowSwitcher(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-blue-100 text-blue-800 font-bold">PAS</span>
                            <div>
                              <p className="font-semibold text-slate-800">Pastor View</p>
                              <p className="text-[10px] text-slate-500">Review & Endorsement</p>
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            const secUser = usersList.find(u => u.username === 'doris') || 
                              usersList.find(u => u.role === 'secretary');
                            if (secUser) switchUserDirect(secUser);
                            setShowSwitcher(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-emerald-100 text-emerald-800 font-bold">SEC</span>
                            <div>
                              <p className="font-semibold text-slate-800">Secretary View</p>
                              <p className="text-[10px] text-slate-500">Create & Submit Form</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* User Pill Card */}
                <div className="flex items-center gap-2 bg-blue-950/70 border border-blue-800/80 rounded-lg px-3 py-1 text-xs">
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-white leading-tight">{user.name}</p>
                    <p className="text-[11px] text-blue-200">{user.branchName || 'District HQ'}</p>
                  </div>
                  {getRoleBadge(user.role)}
                </div>

                {/* Change Password */}
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition"
                  title="Change Password"
                >
                  <Key className="w-4 h-4" />
                </button>

                {/* Logout */}
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
          className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border text-xs font-medium flex items-start justify-between gap-3 animate-in fade-in slide-from-right-4 transition-all ${
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
