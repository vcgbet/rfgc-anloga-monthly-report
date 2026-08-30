import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { api } from '../services/api';
import { ReportPDFView } from '../components/ReportPDFView';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { 
  Building2, 
  Users, 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Key, 
  Download, 
  Upload,
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Copy, 
  Search, 
  Filter, 
  Printer, 
  RefreshCw,
  Award,
  ChevronRight,
  X,
  Database
} from 'lucide-react';

const MONTHS = [
  'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { branches, usersList, reports, addNotification, refreshAll } = useSync();

  const [activeTab, setActiveTab] = useState('branches'); // 'branches', 'logins', 'submitted-entries', 'ai-analytics'
  const [selectedReportForView, setSelectedReportForView] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState(null);

  // Modals state
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchFormData, setBranchFormData] = useState({ name: '', location: '', pastorName: '', secretaryName: '', contactPhone: '', status: 'Active' });

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({ name: '', role: 'pastor', branchName: '', username: '', password: '', phone: '' });

  // Filter state for Submitted Entries
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All Months');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Password visibility state in credentials tab
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // District AI Analytics State
  const [districtAnalytics, setDistrictAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    if (activeTab === 'ai-analytics') {
      loadDistrictAnalytics();
    }
  }, [activeTab, reports, branches]);

  const loadDistrictAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await api.getDistrictAnalytics();
      setDistrictAnalytics(data);
    } catch (err) {
      console.error('Error fetching district analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // --- BRANCH MANAGEMENT ---
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchFormData({ name: '', location: '', pastorName: '', secretaryName: '', contactPhone: '', status: 'Active' });
    setBranchModalOpen(true);
  };

  const handleOpenEditBranch = (branch) => {
    setEditingBranch(branch);
    setBranchFormData({
      name: branch.name,
      location: branch.location || '',
      pastorName: branch.pastorName || '',
      secretaryName: branch.secretaryName || '',
      contactPhone: branch.contactPhone || '',
      status: branch.status || 'Active'
    });
    setBranchModalOpen(true);
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.updateBranch(editingBranch.id, branchFormData);
        addNotification(`Branch "${branchFormData.name}" updated successfully!`, 'success');
      } else {
        await api.createBranch(branchFormData);
        addNotification(`New branch "${branchFormData.name}" created!`, 'success');
      }
      setBranchModalOpen(false);
      refreshAll();
    } catch (err) {
      alert('Error saving branch: ' + err.message);
    }
  };

  const handleDeleteBranch = async (branchId, branchName) => {
    if (!window.confirm(`Are you sure you want to delete branch "${branchName}"?`)) return;
    try {
      await api.deleteBranch(branchId);
      addNotification(`Branch "${branchName}" deleted.`, 'warning');
      refreshAll();
    } catch (err) {
      alert('Error deleting branch: ' + err.message);
    }
  };

  // --- USER / CREDENTIALS MANAGEMENT ---
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({ name: '', role: 'pastor', branchName: branches[0]?.name || '', username: '', password: '', phone: '' });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserFormData({
      name: u.name,
      role: u.role,
      branchName: u.branchName || '',
      username: u.username,
      password: u.password,
      phone: u.phone || ''
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, userFormData);
        addNotification(`User "${userFormData.name}" updated!`, 'success');
      } else {
        await api.createUser(userFormData);
        addNotification(`New ${userFormData.role} account created!`, 'success');
      }
      setUserModalOpen(false);
      refreshAll();
    } catch (err) {
      alert('Error saving user: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await api.deleteUser(userId);
      addNotification(`User account deleted.`, 'warning');
      refreshAll();
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  // --- DATABASE BACKUP & RESTORE ---
  const handleDownloadBackup = () => {
    const backupData = {
      system: 'ANLOGA DISTRICT RHEMA FULL GOSPEL CHURCHES',
      version: '3.0',
      exportedAt: new Date().toISOString(),
      branches,
      users: usersList,
      reports
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anloga-rfgc-database-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification('💾 Database backup downloaded successfully! Keep this file safe.', 'success');
  };

  const handleRestoreFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (!parsed.branches && !parsed.reports && !parsed.users) {
          throw new Error('Invalid backup file structure');
        }
        if (!window.confirm(`Restore database from "${file.name}"? This will sync all contained reports (${parsed.reports?.length || 0}) and branches.`)) {
          return;
        }
        await api.restoreBackup(parsed);
        addNotification('🎉 Database backup restored successfully! All reports and credentials reloaded.', 'success');
        refreshAll();
      } catch (err) {
        alert('Failed to restore backup: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Generate Unique Logins for Pastors & Secretaries
  const handleGenerateUniqueLogins = async () => {
    if (!window.confirm('This will automatically generate fresh unique usernames and passwords for all Pastors & Secretaries. Continue?')) return;
    try {
      await api.generateLogins();
      addNotification('⚡ Unique login credentials generated successfully for all Pastors & Secretaries!', 'success');
      refreshAll();
    } catch (err) {
      alert('Error generating unique logins: ' + err.message);
    }
  };

  const copyCredentialsToClipboard = () => {
    const lines = usersList.map(u => 
      `Role: ${u.role.toUpperCase()} | Name: ${u.name} | Branch: ${u.branchName || 'District HQ'} | Username: ${u.username} | Password: ${u.password}`
    ).join('\n');
    navigator.clipboard.writeText(lines);
    addNotification('All user login credentials copied to clipboard!', 'info');
  };

  // --- SUBMITTED ENTRIES FILTERS ---
  const filteredReports = reports.filter(r => {
    if (filterBranch !== 'All' && r.branchName?.toLowerCase() !== filterBranch.toLowerCase()) return false;
    if (filterMonth !== 'All Months' && r.month !== filterMonth) return false;
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = r.branchName?.toLowerCase().includes(q) ||
                    r.pastorName?.toLowerCase().includes(q) ||
                    r.month?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalDistrictFinance = reports.reduce((acc, r) => acc + (parseFloat(r.finance?.total) || 0), 0);
  const totalDistrictAttendance = reports.reduce((acc, r) => {
    return acc + (r.sundayAttendance || []).reduce((sum, s) => sum + (s.total || 0), 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner with Admin Controls & Change Password Button */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-800 rounded-2xl border border-amber-300">
            <ShieldCheck className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-serif">District Admin Executive Dashboard</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                Tier 3 Master
              </span>
            </div>
            <p className="text-xs text-slate-500">
              District Headquarters Control: Branches, Login Credentials, Reports & AI Intelligence
            </p>
          </div>
        </div>

        {/* Action Buttons: Change Password, Backup, Restore & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadBackup}
            className="px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
            title="Download full JSON backup of all submitted reports, users and branches"
          >
            <Download className="w-3.5 h-3.5 text-emerald-300" />
            <span>Backup Data</span>
          </button>

          <label className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5 cursor-pointer" title="Restore database from a saved JSON backup file">
            <Upload className="w-3.5 h-3.5 text-blue-300" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              setPasswordTargetUser(user);
              setShowPasswordModal(true);
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
            title="Change your admin password"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Change Password</span>
          </button>

          <button
            onClick={() => refreshAll()}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh All Synced Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ADMIN DASHBOARD TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'branches'
              ? 'bg-blue-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>a. Branches ({branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logins')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'logins'
              ? 'bg-blue-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>b. Secretary/Pastors & Login Credentials ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submitted-entries')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'submitted-entries'
              ? 'bg-blue-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>c. Submitted Entries ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'ai-analytics'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>d. AI Analytics & District Intelligence</span>
        </button>
      </div>

      {/* TAB A: BRANCHES */}
      {activeTab === 'branches' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">District Branch Assemblies</h3>
              <p className="text-xs text-slate-500">
                Manage all registered local church branches, pastors, and secretaries.
              </p>
            </div>
            <button
              onClick={handleOpenAddBranch}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Branch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => {
              const branchReportCount = reports.filter(r => r.branchName?.toLowerCase() === b.name?.toLowerCase()).length;
              return (
                <div
                  key={b.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-bold rounded-full uppercase">
                        {b.status || 'Active'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {branchReportCount} Reports
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-blue-950 font-serif">{b.name}</h4>
                    <p className="text-xs text-slate-500">{b.location || 'Anloga District'}</p>

                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pastor:</span>
                        <span className="font-semibold text-slate-800">{b.pastorName || 'Unassigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Secretary:</span>
                        <span className="font-semibold text-slate-800">{b.secretaryName || 'Unassigned'}</span>
                      </div>
                      {b.contactPhone && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Contact:</span>
                          <span className="font-mono text-slate-700">{b.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleOpenEditBranch(b)}
                      className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                      title="Edit Branch"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(b.id, b.name)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Delete Branch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB B: SECRETARY / PASTORS & LOGIN CREDENTIALS */}
      {activeTab === 'logins' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">Pastors, Secretaries & Login Directory</h3>
              <p className="text-xs text-slate-500">
                Manage accounts, view passwords, or automatically generate unique credentials.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGenerateUniqueLogins}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
                title="Automatically generate unique logins and secure passwords for all pastors and secretaries"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto-Generate Unique Logins</span>
              </button>

              <button
                onClick={copyCredentialsToClipboard}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                title="Copy all credentials to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All</span>
              </button>

              <button
                onClick={handleOpenAddUser}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New User</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Branch Assembly</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Password</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => {
                  const isVisible = visiblePasswords[u.id];
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        {u.role === 'admin' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            ADMIN
                          </span>
                        )}
                        {u.role === 'pastor' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                            PASTOR
                          </span>
                        )}
                        {u.role === 'secretary' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            SECRETARY
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {u.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {u.branchName || 'District HQ'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-900">
                        {u.username}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="inline-flex items-center gap-2">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-800">
                            {isVisible ? u.password : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                            title={isVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setPasswordTargetUser(u);
                              setShowPasswordModal(true);
                            }}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition"
                            title="Reset / Change Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB C: SUBMITTED ENTRIES */}
      {activeTab === 'submitted-entries' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">District Master Submitted Entries</h3>
              <p className="text-xs text-slate-500">
                Real-time synchronized reports across all 6 district assemblies.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Total District Finance: </span>
              <span className="text-base font-extrabold text-emerald-800">
                GH₵ {totalDistrictFinance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            {/* Filter by Branch */}
            <div>
              <label className="block font-bold text-slate-600 mb-1">Filter Branch</label>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="All">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Filter by Month */}
            <div>
              <label className="block font-bold text-slate-600 mb-1">Filter Month</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
              >
                {MONTHS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <label className="block font-bold text-slate-600 mb-1">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="endorsed">Endorsed (Ready)</option>
                <option value="submitted_to_pastor">Pending Pastor Review</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Search Query */}
            <div>
              <label className="block font-bold text-slate-600 mb-1">Search Keywords</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pastor, branch..."
                  className="w-full pl-8 pr-2 py-2 bg-white border border-slate-300 rounded-lg font-medium"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Master Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Branch Assembly</th>
                  <th className="py-3 px-4">Pastor</th>
                  <th className="py-3 px-4">Secretary</th>
                  <th className="py-3 px-4 text-center">Sundays</th>
                  <th className="py-3 px-4 text-right">Tithes</th>
                  <th className="py-3 px-4 text-right">Total Finance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-blue-950">
                      {rep.month} {rep.year}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {rep.branchName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {rep.pastorName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {rep.endorsement?.churchSecretary?.name || 'Secretary'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">
                      {rep.sundayAttendance?.length || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      GH₵ {(parseFloat(rep.finance?.tithes) || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-blue-950">
                      GH₵ {(parseFloat(rep.finance?.total) || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {rep.status === 'endorsed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Endorsed / Received
                        </span>
                      ) : rep.status === 'submitted_to_pastor' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Pending Pastor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedReportForView(rep)}
                          className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow"
                          title="View Official Styled PDF"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF Export
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                      No reports match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB D: AI ANALYTICS & DISTRICT INTELLIGENCE */}
      {activeTab === 'ai-analytics' && (
        <div className="space-y-6">
          {loadingAnalytics ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
              <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Generating District AI Intelligence...</p>
            </div>
          ) : districtAnalytics ? (
            <>
              {/* Executive District Overview Card */}
              <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border-b-4 border-amber-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> District Synod AI Briefing
                  </span>
                  <span className="text-xs text-blue-200">Anloga District RFGC</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif">
                  District Monthly Executive Assessment
                </h3>
                <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl">
                  Automated intelligence synthesis covering all 6 local churches: financial vitality, demographic distribution, district levy compliance, and pastoral recommendations.
                </p>
              </div>

              {/* District KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total District Finance</p>
                  <p className="text-2xl font-extrabold text-emerald-800 mt-1">GH₵ {districtAnalytics.overview?.grandDistrictFinance}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Across all assemblies</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total District Tithes</p>
                  <p className="text-2xl font-extrabold text-blue-950 mt-1">GH₵ {districtAnalytics.overview?.districtTithes}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">District tithing total</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">District Levy Inflow</p>
                  <p className="text-2xl font-extrabold text-amber-700 mt-1">GH₵ {districtAnalytics.overview?.districtLevyTotal}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Headquarters levy</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sunday Headcount</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{districtAnalytics.overview?.totalDistrictAttendance} Attendees</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Recorded Sundays aggregate</p>
                </div>
              </div>

              {/* Branch Comparative Matrix & Demographics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Branch Performance Rankings */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Branch Performance & Vitality Matrix</span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="py-2.5 px-3">Branch</th>
                          <th className="py-2.5 px-2">Pastor</th>
                          <th className="py-2.5 px-2 text-right">Finance</th>
                          <th className="py-2.5 px-2 text-right">Levy</th>
                          <th className="py-2.5 px-2 text-center">Health Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(districtAnalytics.branchRankings || []).map((b, idx) => (
                          <tr key={b.branchId || idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {b.branchName}
                            </td>
                            <td className="py-2.5 px-2 text-slate-600">
                              {b.pastorName}
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold text-emerald-800">
                              GH₵ {b.totalFinance.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold text-amber-700">
                              GH₵ {b.districtLevy.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                                {b.healthGrade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* District Demographic Heatmap */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-700" />
                    <span>District-Wide Demographic Ratio</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Women ({districtAnalytics.districtDemographics?.women} members)</span>
                        <span>{districtAnalytics.districtDemographics?.womenPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-pink-600 h-full rounded-full"
                          style={{ width: `${districtAnalytics.districtDemographics?.womenPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Youth ({districtAnalytics.districtDemographics?.youth} members)</span>
                        <span>{districtAnalytics.districtDemographics?.youthPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${districtAnalytics.districtDemographics?.youthPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Men ({districtAnalytics.districtDemographics?.men} members)</span>
                        <span>{districtAnalytics.districtDemographics?.menPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-700 h-full rounded-full"
                          style={{ width: `${districtAnalytics.districtDemographics?.menPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Children ({districtAnalytics.districtDemographics?.children} members)</span>
                        <span>{districtAnalytics.districtDemographics?.childrenPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${districtAnalytics.districtDemographics?.childrenPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* AI Narrative Insights & Executive Recommendations */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>District AI Intelligence & Synod Recommendations</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <p className="font-bold text-slate-800">📊 Synod Observations:</p>
                    {(districtAnalytics.executiveInsights || []).map((item, idx) => (
                      <div key={idx} className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-slate-800">
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-amber-900">🎯 Action Items for District Overseer & Council:</p>
                    {(districtAnalytics.executiveRecommendations || []).map((item, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-slate-800">
                        ✓ {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center">
              <p className="text-sm font-semibold">No analytics data available.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT BRANCH */}
      {branchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-blue-950 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingBranch ? 'Edit Branch Assembly' : 'Create New Branch Assembly'}
              </h3>
              <button onClick={() => setBranchModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  value={branchFormData.name}
                  onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })}
                  placeholder="e.g. DZODZE – GRACE CHAPEL"
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Town *</label>
                <input
                  type="text"
                  value={branchFormData.location}
                  onChange={(e) => setBranchFormData({ ...branchFormData, location: e.target.value })}
                  placeholder="e.g. Dzodze, Volta Region"
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Pastor</label>
                  <input
                    type="text"
                    value={branchFormData.pastorName}
                    onChange={(e) => setBranchFormData({ ...branchFormData, pastorName: e.target.value })}
                    placeholder="Pastor Full Name"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Secretary</label>
                  <input
                    type="text"
                    value={branchFormData.secretaryName}
                    onChange={(e) => setBranchFormData({ ...branchFormData, secretaryName: e.target.value })}
                    placeholder="Secretary Full Name"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={branchFormData.contactPhone}
                  onChange={(e) => setBranchFormData({ ...branchFormData, contactPhone: e.target.value })}
                  placeholder="e.g. 0240000000"
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBranchModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 text-white rounded-lg font-bold shadow"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT USER */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-blue-950 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingUser ? 'Edit User Credentials' : 'Create New Pastor / Secretary Account'}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="pastor">Pastor</option>
                    <option value="secretary">Secretary</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Assembly *</label>
                  <select
                    value={userFormData.branchName}
                    onChange={(e) => setUserFormData({ ...userFormData, branchName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="">(Select Branch)</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="e.g. Pastor John Doe / Sister Mary"
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    placeholder="e.g. pastor.chapel.4"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold text-blue-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="text"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder="Password"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 text-white rounded-lg font-bold shadow"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF View Modal */}
      {selectedReportForView && (
        <ReportPDFView
          report={selectedReportForView}
          onClose={() => setSelectedReportForView(null)}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          targetUser={passwordTargetUser}
          onClose={() => {
            setShowPasswordModal(false);
            setPasswordTargetUser(null);
          }}
        />
      )}

    </div>
  );
};
