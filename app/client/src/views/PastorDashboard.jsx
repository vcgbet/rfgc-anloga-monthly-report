import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { api } from '../services/api';
import { SignaturePad } from '../components/SignaturePad';
import { ReportPDFView } from '../components/ReportPDFView';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sparkles, 
  Download, 
  Send, 
  Edit3, 
  Plus, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Award,
  AlertCircle,
  Eye,
  Building2,
  Printer
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const ACTIVITIES = [
  'Bible Studies',
  'Crusade',
  'Fasting & Prayers',
  'Prayer Service',
  'Revival Service',
  'Others'
];

export const PastorDashboard = () => {
  const { user } = useAuth();
  const { branches, reports, addNotification } = useSync();

  const [activeTab, setActiveTab] = useState('review-endorse'); // 'review-endorse', 'submitted-entries', 'ai-analytics'
  const [selectedReportForView, setSelectedReportForView] = useState(null);
  const [activeReportToReview, setActiveReportToReview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [branchAnalytics, setBranchAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Filter reports belonging to this Pastor's branch
  const pastorBranchName = user?.branchName || 'GENUI – LOVE CHAPEL';
  const branchReports = reports.filter(r => {
    if (!pastorBranchName) return true;
    return r.branchName?.toLowerCase() === pastorBranchName.toLowerCase() ||
           (user?.name && r.pastorName?.toLowerCase().includes(user.name.toLowerCase()));
  });

  const pendingReports = branchReports.filter(r => r.status === 'submitted_to_pastor');
  const endorsedReports = branchReports.filter(r => r.status === 'endorsed' || r.status === 'approved_admin');

  // Load analytics when switching to AI Analytics tab
  useEffect(() => {
    if (activeTab === 'ai-analytics') {
      loadBranchAnalytics();
    }
  }, [activeTab, pastorBranchName, reports]);

  const loadBranchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await api.getBranchAnalytics(pastorBranchName);
      setBranchAnalytics(data);
    } catch (err) {
      console.error('Error fetching branch analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Select a report for Review & Endorsement
  const handleStartReview = (report) => {
    // Clone report into active review state
    setActiveReportToReview({
      ...report,
      endorsement: {
        ...report.endorsement,
        branchPastor: {
          name: report.endorsement?.branchPastor?.name || user?.name || 'Pastor Victor C. Gbetodeme',
          date: report.endorsement?.branchPastor?.date || new Date().toISOString().split('T')[0],
          signatureData: report.endorsement?.branchPastor?.signatureData || '',
          remarks: report.endorsement?.branchPastor?.remarks || '',
        }
      }
    });
    setActiveTab('review-endorse');
  };

  // Sunday attendance handlers for Pastor editing
  const addSundayRow = () => {
    if (!activeReportToReview) return;
    setActiveReportToReview(prev => ({
      ...prev,
      sundayAttendance: [
        ...(prev.sundayAttendance || []),
        { id: `sun-${Date.now()}`, date: '', children: 0, youth: 0, women: 0, men: 0, total: 0 }
      ]
    }));
  };

  const removeSundayRow = (id) => {
    if (!activeReportToReview) return;
    setActiveReportToReview(prev => ({
      ...prev,
      sundayAttendance: prev.sundayAttendance.filter(s => s.id !== id)
    }));
  };

  const updateSundayRow = (id, field, value) => {
    if (!activeReportToReview) return;
    setActiveReportToReview(prev => ({
      ...prev,
      sundayAttendance: prev.sundayAttendance.map(s => {
        if (s.id === id) {
          const updated = { ...s, [field]: value };
          const c = parseInt(updated.children) || 0;
          const y = parseInt(updated.youth) || 0;
          const w = parseInt(updated.women) || 0;
          const m = parseInt(updated.men) || 0;
          updated.total = c + y + w + m;
          return updated;
        }
        return s;
      })
    }));
  };

  // Weekday attendance handlers
  const addWeekdayRow = () => {
    if (!activeReportToReview) return;
    setActiveReportToReview(prev => ({
      ...prev,
      weekdayAttendance: [
        ...(prev.weekdayAttendance || []),
        { id: `wk-${Date.now()}`, day: 'Tuesday', activity: 'Prayer Service', customActivity: '', children: 0, youth: 0, women: 0, men: 0 }
      ]
    }));
  };

  const removeWeekdayRow = (id) => {
    if (!activeReportToReview) return;
    setActiveReportToReview(prev => ({
      ...prev,
      weekdayAttendance: prev.weekdayAttendance.filter(w => w.id !== id)
    }));
  };

  const updateWeekdayRow = (id, field, value) => {
    if (!activeReportToReview) return;
    setActiveReportToReview(prev => ({
      ...prev,
      weekdayAttendance: prev.weekdayAttendance.map(w => (w.id === id ? { ...w, [field]: value } : w))
    }));
  };

  // Finance update handler
  const updateFinanceField = (field, value) => {
    if (!activeReportToReview) return;
    setActiveReportToReview(prev => ({
      ...prev,
      finance: {
        ...prev.finance,
        [field]: value
      }
    }));
  };

  // Pastor Endorsement field updater
  const updatePastorEndorsement = (field, value) => {
    if (!activeReportToReview) return;
    setActiveReportToReview(prev => ({
      ...prev,
      endorsement: {
        ...prev.endorsement,
        branchPastor: {
          ...prev.endorsement?.branchPastor,
          [field]: value
        }
      }
    }));
  };

  // Save changes without endorsing
  const handleSaveEditsOnly = async () => {
    if (!activeReportToReview) return;
    setIsSaving(true);
    try {
      await api.updateReport(activeReportToReview.id, activeReportToReview, user);
      addNotification('Report changes saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving edits:', err);
      alert('Error saving edits: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Endorsed Report to District Admin
  const handleSubmitEndorsedReport = async () => {
    if (!activeReportToReview) return;
    
    const pastorSig = activeReportToReview.endorsement?.branchPastor?.signatureData;
    if (!pastorSig) {
      const proceed = window.confirm(
        'You have not added your Pastor digital signature / stamp. Do you want to submit endorsement without it?'
      );
      if (!proceed) return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...activeReportToReview,
        status: 'endorsed',
        endorsement: {
          ...activeReportToReview.endorsement,
          branchPastor: {
            name: activeReportToReview.endorsement?.branchPastor?.name || user?.name || 'Pastor Victor C. Gbetodeme',
            date: activeReportToReview.endorsement?.branchPastor?.date || new Date().toISOString().split('T')[0],
            signatureData: pastorSig || '',
            remarks: activeReportToReview.endorsement?.branchPastor?.remarks || 'Endorsed and submitted to District Administration.',
          }
        }
      };

      await api.endorseReport(activeReportToReview.id, payload, user);
      addNotification('🎉 Report successfully endorsed and transmitted to District Admin!', 'success');
      setActiveReportToReview(null);
      setActiveTab('submitted-entries');
    } catch (err) {
      console.error('Error endorsing report:', err);
      alert('Error endorsing report: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate finance total
  const calculatedFinanceTotal = activeReportToReview ? (
    (parseFloat(activeReportToReview.finance?.tithes) || 0) +
    (parseFloat(activeReportToReview.finance?.sundayOfferings) || 0) +
    (parseFloat(activeReportToReview.finance?.weekdayOfferings) || 0) +
    (parseFloat(activeReportToReview.finance?.evangelismOffering) || 0) +
    (parseFloat(activeReportToReview.finance?.districtLevy) || 0) +
    (parseFloat(activeReportToReview.finance?.exchangeOfPulpit) || 0)
  ) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-900 rounded-xl">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-serif">Branch Pastor Portal</h2>
              <p className="text-xs text-slate-500">
                Pastor: <strong className="text-slate-800">{user?.name}</strong> • Branch: <strong className="text-blue-900">{pastorBranchName}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('review-endorse')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'review-endorse'
                ? 'bg-blue-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Review & Endorsement</span>
            {pendingReports.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-extrabold animate-pulse">
                {pendingReports.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('submitted-entries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'submitted-entries'
                ? 'bg-blue-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Submitted Entries ({branchReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'ai-analytics'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Analytics & Insights</span>
          </button>
        </div>
      </div>

      {/* TAB 1: REVIEW & ENDORSEMENT */}
      {activeTab === 'review-endorse' && (
        <div className="space-y-6">
          
          {/* If no active report is selected, show pending list to pick */}
          {!activeReportToReview ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 font-serif">Reports Awaiting Pastoral Review</h3>
                <p className="text-xs text-slate-500">
                  Select a secretary submission to review, modify if necessary, digitally sign off, and endorse to Admin.
                </p>
              </div>

              {pendingReports.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No pending reports awaiting endorsement</p>
                  <p className="text-xs text-slate-500 mt-1">
                    All monthly reports for {pastorBranchName} are currently up to date and endorsed.
                  </p>
                  {branchReports.length > 0 && (
                    <button
                      onClick={() => handleStartReview(branchReports[0])}
                      className="mt-4 px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-xl shadow hover:bg-blue-800 transition inline-flex items-center gap-1.5"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Review / Re-endorse Previous Report ({branchReports[0].month} {branchReports[0].year})</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingReports.map(rep => (
                    <div
                      key={rep.id}
                      className="bg-amber-50/60 border-2 border-amber-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-amber-200 text-amber-900 text-xs font-bold rounded-full flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Ready for Endorsement
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {rep.month} {rep.year}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900">{rep.branchName}</h4>
                        <p className="text-xs text-slate-600">
                          Submitted by Secretary: <strong>{rep.endorsement?.churchSecretary?.name || 'Secretary'}</strong>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-amber-200">
                        <div>
                          <p className="text-slate-500">Sundays Recorded:</p>
                          <p className="font-bold text-slate-900">{rep.sundayAttendance?.length || 0} Sessions</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Total Finance:</p>
                          <p className="font-bold text-emerald-800">GH₵ {(parseFloat(rep.finance?.total) || 0).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleStartReview(rep)}
                          className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Review & Endorse This Report</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ACTIVE REVIEW & EDIT FORM FOR PASTOR */
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              
              {/* Pastor Review Banner */}
              <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-8 border-b-4 border-amber-500 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-1 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-full uppercase tracking-wider inline-block mb-2">
                    Pastoral Review & Endorsement Mode
                  </span>
                  <h2 className="text-lg sm:text-2xl font-bold uppercase tracking-wider font-serif">
                    {activeReportToReview.branchName} — {activeReportToReview.month} {activeReportToReview.year} Report
                  </h2>
                  <p className="text-xs text-blue-200 mt-1">
                    You can edit all submitted details below before endorsing. Once endorsed, this report will instantly land in the Admin Dashboard.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReportForView(activeReportToReview)}
                    className="px-3.5 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Official PDF</span>
                  </button>
                  <button
                    onClick={() => setActiveReportToReview(null)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                  >
                    Back to List
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-8">
                
                {/* 1. Branch & Period Info */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">1</span>
                    <span>Report Header Information</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Branch Name</label>
                      <input
                        type="text"
                        value={activeReportToReview.branchName || ''}
                        onChange={(e) => setActiveReportToReview({ ...activeReportToReview, branchName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Month</label>
                      <select
                        value={activeReportToReview.month || 'January'}
                        onChange={(e) => setActiveReportToReview({ ...activeReportToReview, month: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
                      >
                        {MONTHS.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Branch Pastor</label>
                      <input
                        type="text"
                        value={activeReportToReview.pastorName || ''}
                        onChange={(e) => setActiveReportToReview({ ...activeReportToReview, pastorName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Sunday Attendance (Editable by Pastor) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">2</span>
                      <span>Sunday Attendance (Editable)</span>
                    </h4>
                    <button
                      type="button"
                      onClick={addSundayRow}
                      className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> ADD+ SUNDAY
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-blue-900 text-white font-bold text-center">
                          <th className="py-2.5 px-3 text-left">Sunday Date</th>
                          <th className="py-2.5 px-2">Children</th>
                          <th className="py-2.5 px-2">Youth</th>
                          <th className="py-2.5 px-2">Women</th>
                          <th className="py-2.5 px-2">Men</th>
                          <th className="py-2.5 px-3 bg-blue-950 font-bold">Total</th>
                          <th className="py-2.5 px-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(activeReportToReview.sundayAttendance || []).map((row, idx) => (
                          <tr key={row.id || idx}>
                            <td className="p-2 min-w-[150px]">
                              <input
                                type="date"
                                value={row.date}
                                onChange={(e) => updateSundayRow(row.id, 'date', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={row.children}
                                onChange={(e) => updateSundayRow(row.id, 'children', e.target.value)}
                                className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 font-semibold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={row.youth}
                                onChange={(e) => updateSundayRow(row.id, 'youth', e.target.value)}
                                className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 font-semibold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={row.women}
                                onChange={(e) => updateSundayRow(row.id, 'women', e.target.value)}
                                className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 font-semibold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={row.men}
                                onChange={(e) => updateSundayRow(row.id, 'men', e.target.value)}
                                className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 font-semibold"
                              />
                            </td>
                            <td className="p-2 text-center bg-blue-50 font-bold text-blue-900">
                              {row.total || 0}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeSundayRow(row.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Week Day Attendance (Editable) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">3</span>
                      <span>Week Day Attendance (Editable)</span>
                    </h4>
                    <button
                      type="button"
                      onClick={addWeekdayRow}
                      className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> ADD+ DAY
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-blue-900 text-white font-bold text-center">
                          <th className="py-2.5 px-3 text-left">Day</th>
                          <th className="py-2.5 px-3 text-left min-w-[200px]">Activity</th>
                          <th className="py-2.5 px-2">Children</th>
                          <th className="py-2.5 px-2">Youth</th>
                          <th className="py-2.5 px-2">Women</th>
                          <th className="py-2.5 px-2">Men</th>
                          <th className="py-2.5 px-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(activeReportToReview.weekdayAttendance || []).map((row, idx) => (
                          <tr key={row.id || idx}>
                            <td className="p-2 min-w-[120px]">
                              <select
                                value={row.day}
                                onChange={(e) => updateWeekdayRow(row.id, 'day', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold"
                              >
                                {DAYS_OF_WEEK.map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2">
                              <div className="space-y-1">
                                <select
                                  value={row.activity}
                                  onChange={(e) => updateWeekdayRow(row.id, 'activity', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold"
                                >
                                  {ACTIVITIES.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                  ))}
                                </select>
                                {row.activity === 'Others' && (
                                  <input
                                    type="text"
                                    value={row.customActivity || ''}
                                    onChange={(e) => updateWeekdayRow(row.id, 'customActivity', e.target.value)}
                                    placeholder="Type custom activity..."
                                    className="w-full bg-amber-50 border border-amber-300 rounded-lg px-2 py-1 text-xs"
                                  />
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={row.children}
                                onChange={(e) => updateWeekdayRow(row.id, 'children', e.target.value)}
                                className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 font-semibold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={row.youth}
                                onChange={(e) => updateWeekdayRow(row.id, 'youth', e.target.value)}
                                className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 font-semibold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={row.women}
                                onChange={(e) => updateWeekdayRow(row.id, 'women', e.target.value)}
                                className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 font-semibold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={row.men}
                                onChange={(e) => updateWeekdayRow(row.id, 'men', e.target.value)}
                                className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 font-semibold"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeWeekdayRow(row.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Finance (Editable by Pastor) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">4</span>
                      <span>Finance Section (GH¢)</span>
                    </h4>
                    <span className="text-sm font-bold text-blue-900">
                      Total: GH₵ {calculatedFinanceTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 border border-slate-200 rounded-xl">
                      <label className="block text-xs font-bold text-slate-700 mb-1">A. TITHES (GH¢)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={activeReportToReview.finance?.tithes ?? ''}
                        onChange={(e) => updateFinanceField('tithes', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div className="bg-white p-3 border border-slate-200 rounded-xl">
                      <label className="block text-xs font-bold text-slate-700 mb-1">D. EVANGELISM OFFERING (GH¢)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={activeReportToReview.finance?.evangelismOffering ?? ''}
                        onChange={(e) => updateFinanceField('evangelismOffering', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div className="bg-white p-3 border border-slate-200 rounded-xl">
                      <label className="block text-xs font-bold text-slate-700 mb-1">B. SUNDAY OFFERINGS (GH¢)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={activeReportToReview.finance?.sundayOfferings ?? ''}
                        onChange={(e) => updateFinanceField('sundayOfferings', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div className="bg-white p-3 border border-slate-200 rounded-xl">
                      <label className="block text-xs font-bold text-slate-700 mb-1">E. DISTRICT LEVY (GH¢)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={activeReportToReview.finance?.districtLevy ?? ''}
                        onChange={(e) => updateFinanceField('districtLevy', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div className="bg-white p-3 border border-slate-200 rounded-xl">
                      <label className="block text-xs font-bold text-slate-700 mb-1">C. WEEK DAY OFFERINGS (GH¢)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={activeReportToReview.finance?.weekdayOfferings ?? ''}
                        onChange={(e) => updateFinanceField('weekdayOfferings', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div className="bg-white p-3 border border-slate-200 rounded-xl">
                      <label className="block text-xs font-bold text-slate-700 mb-1">F. EXCHANGE OF PULPIT (GH¢)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={activeReportToReview.finance?.exchangeOfPulpit ?? ''}
                        onChange={(e) => updateFinanceField('exchangeOfPulpit', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Endorsements: Shows Secretary signature + PASTOR ENDORSEMENT SECTION */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
                  <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">5</span>
                    <span>Endorsement Section</span>
                  </h4>

                  {/* A. Church Secretary Info (Read/View) */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      A. Church Secretary Submission
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Secretary Name: </span>
                        <strong className="text-slate-900">{activeReportToReview.endorsement?.churchSecretary?.name || 'Secretary'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Date: </span>
                        <strong className="text-slate-900">{activeReportToReview.endorsement?.churchSecretary?.date || '—'}</strong>
                      </div>
                    </div>
                    {activeReportToReview.endorsement?.churchSecretary?.signatureData && (
                      <div className="mt-2 h-14 w-36 bg-slate-50 rounded border border-slate-200 p-1 flex items-center">
                        <img
                          src={activeReportToReview.endorsement.churchSecretary.signatureData}
                          alt="Secretary Signature"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* B. Branch Pastor Endorsement (Upload & Drawing Pad) */}
                  <div className="p-4 bg-blue-50/70 border-2 border-blue-200 rounded-xl space-y-4">
                    <p className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                      B. Branch Pastor Endorsement & Official Sign-Off
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Branch Pastor Name *
                        </label>
                        <input
                          type="text"
                          value={activeReportToReview.endorsement?.branchPastor?.name || user?.name || ''}
                          onChange={(e) => updatePastorEndorsement('name', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Endorsement Date *
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="date"
                            value={activeReportToReview.endorsement?.branchPastor?.date || new Date().toISOString().split('T')[0]}
                            onChange={(e) => updatePastorEndorsement('date', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
                            required
                          />
                          <Calendar className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Signature Pad & Upload for Pastor */}
                    <div>
                      <SignaturePad
                        value={activeReportToReview.endorsement?.branchPastor?.signatureData || ''}
                        onChange={(sig) => updatePastorEndorsement('signatureData', sig)}
                        label="Branch Pastor Signature / Official Church Stamp (Draw or Upload)"
                        signerRole="Pastor"
                        allowUpload={true}
                        allowDraw={true}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Pastoral Remarks / Comments for District Admin (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={activeReportToReview.endorsement?.branchPastor?.remarks || ''}
                        onChange={(e) => updatePastorEndorsement('remarks', e.target.value)}
                        placeholder="e.g. Endorsed and submitted to District Administration. Steady attendance growth recorded."
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleSaveEditsOnly}
                      disabled={isSaving}
                      className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedReportForView(activeReportToReview)}
                      className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Export PDF
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitEndorsedReport}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isSaving ? 'Endorsing...' : 'Submit Endorsed Report to Admin'}</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: SUBMITTED ENTRIES */}
      {activeTab === 'submitted-entries' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">Branch Reports & Status History</h3>
              <p className="text-xs text-slate-500">
                All submitted and endorsed monthly reports for {pastorBranchName}.
              </p>
            </div>
          </div>

          {branchReports.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No reports recorded for this branch yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Secretary</th>
                    <th className="py-3 px-4">Sundays</th>
                    <th className="py-3 px-4 text-right">Total Finance</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branchReports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-blue-950">
                        {rep.month} {rep.year}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {rep.branchName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {rep.endorsement?.churchSecretary?.name || 'Secretary'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {rep.sundayAttendance?.length || 0} Sundays
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        GH₵ {(parseFloat(rep.finance?.total) || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {rep.status === 'endorsed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Endorsed & Transmitted
                          </span>
                        ) : rep.status === 'submitted_to_pastor' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Pending Your Endorsement
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
                            onClick={() => handleStartReview(rep)}
                            className="px-2.5 py-1.5 bg-blue-900 text-white hover:bg-blue-800 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                            title="Review and Edit Report"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Review / Edit
                          </button>
                          <button
                            onClick={() => setSelectedReportForView(rep)}
                            className="px-2.5 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold transition flex items-center gap-1 border border-blue-200"
                            title="Export / Download Official PDF"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI ANALYTICS */}
      {activeTab === 'ai-analytics' && (
        <div className="space-y-6">
          {loadingAnalytics ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
              <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Generating AI Branch Intelligence...</p>
            </div>
          ) : branchAnalytics && branchAnalytics.status !== 'insufficient_data' ? (
            <>
              {/* Top AI Health Card */}
              <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border-b-4 border-amber-500 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> AI Pastoral Intelligence
                    </span>
                    <span className="text-xs text-blue-200">{branchAnalytics.branchName}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif">
                    Branch Health Grade: <span className="text-amber-400">{branchAnalytics.healthGrade}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-xl">
                    Composite score based on attendance consistency, demographic vitality, weekday prayer participation, and district levy compliance.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[140px]">
                  <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Vitality Score</p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 mt-1">{branchAnalytics.healthScore}%</p>
                  <p className="text-[10px] text-emerald-300 mt-0.5">High Performance</p>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Sunday Attendance</p>
                  <p className="text-2xl font-extrabold text-blue-950 mt-1">{branchAnalytics.summary?.avgSundayAttendance} Members</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Across recorded Sundays</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tithes</p>
                  <p className="text-2xl font-extrabold text-emerald-800 mt-1">GH₵ {branchAnalytics.summary?.totalTithes}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Faithful branch tithes</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Offerings</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    GH₵ {(parseFloat(branchAnalytics.summary?.totalSundayOfferings || 0) + parseFloat(branchAnalytics.summary?.totalWeekdayOfferings || 0)).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sunday & Weekday</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">District Levy Paid</p>
                  <p className="text-2xl font-extrabold text-amber-700 mt-1">GH₵ {branchAnalytics.summary?.totalDistrictLevy}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">District governance quota</p>
                </div>
              </div>

              {/* Demographics & Weekday Activity Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Demographic Breakdown */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-700" />
                    <span>Demographic Composition</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Women ({branchAnalytics.demographicBreakdown?.women} attendees)</span>
                        <span>{branchAnalytics.demographicBreakdown?.womenPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-pink-600 h-full rounded-full"
                          style={{ width: `${branchAnalytics.demographicBreakdown?.womenPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Youth ({branchAnalytics.demographicBreakdown?.youth} attendees)</span>
                        <span>{branchAnalytics.demographicBreakdown?.youthPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${branchAnalytics.demographicBreakdown?.youthPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Men ({branchAnalytics.demographicBreakdown?.men} attendees)</span>
                        <span>{branchAnalytics.demographicBreakdown?.menPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-700 h-full rounded-full"
                          style={{ width: `${branchAnalytics.demographicBreakdown?.menPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Children ({branchAnalytics.demographicBreakdown?.children} attendees)</span>
                        <span>{branchAnalytics.demographicBreakdown?.childrenPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${branchAnalytics.demographicBreakdown?.childrenPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Automated Insights & Pastoral Action Plan */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>AI Narrative Insights & Action Plan</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-2">
                      <p className="font-bold text-slate-800">🔍 Observations:</p>
                      {(branchAnalytics.aiInsights || []).map((ins, idx) => (
                        <div key={idx} className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-slate-700 flex items-start gap-2">
                          <span className="text-blue-700 font-bold">•</span>
                          <span>{ins}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="font-bold text-amber-900">💡 Recommended Pastoral Strategies:</p>
                      {(branchAnalytics.recommendations || []).map((rec, idx) => (
                        <div key={idx} className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 text-slate-800 flex items-start gap-2">
                          <span className="text-amber-600 font-bold">✓</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <p className="text-sm font-semibold text-slate-700">No report data submitted yet to generate AI Analytics.</p>
            </div>
          )}
        </div>
      )}

      {/* PDF View Modal */}
      {selectedReportForView && (
        <ReportPDFView
          report={selectedReportForView}
          onClose={() => setSelectedReportForView(null)}
        />
      )}

    </div>
  );
};
