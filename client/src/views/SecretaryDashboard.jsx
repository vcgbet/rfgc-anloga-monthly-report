import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { api } from '../services/api';
import { SignaturePad } from '../components/SignaturePad';
import { ReportPDFView } from '../components/ReportPDFView';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Send, 
  Save, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Building2, 
  User, 
  DollarSign, 
  Users, 
  Sparkles,
  Edit,
  ArrowRight
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

export const SecretaryDashboard = () => {
  const { user } = useAuth();
  const { branches, usersList, reports, addNotification } = useSync();

  const [activeTab, setActiveTab] = useState('new-report'); // 'new-report', 'submitted-entries'
  const [selectedReportForView, setSelectedReportForView] = useState(null);
  const [editingReportId, setEditingReportId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [branchName, setBranchName] = useState(user?.branchName || 'GENUI – LOVE CHAPEL');
  const [branchId, setBranchId] = useState(user?.branchId || '');
  const [month, setMonth] = useState('January');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [pastorName, setPastorName] = useState('');
  
  // Sunday Attendance State
  const [sundayAttendance, setSundayAttendance] = useState([
    { id: 'sun-1', date: new Date().toISOString().split('T')[0], children: '', youth: '', women: '', men: '', total: 0 }
  ]);

  // Weekday Attendance State
  const [weekdayAttendance, setWeekdayAttendance] = useState([
    { id: 'wk-1', day: 'Tuesday', activity: 'Prayer Service', customActivity: '', children: '', youth: '', women: '', men: '' }
  ]);

  // Finance State
  const [finance, setFinance] = useState({
    tithes: '',
    sundayOfferings: '',
    weekdayOfferings: '',
    evangelismOffering: '',
    districtLevy: '',
    exchangeOfPulpit: '',
  });

  // Endorsement State (Secretary only on this form)
  const [secretaryName, setSecretaryName] = useState(user?.name || 'Doris Tetteh');
  const [secretaryDate, setSecretaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [secretarySignature, setSecretarySignature] = useState('');

  // Auto populate Pastor name when Branch changes
  useEffect(() => {
    const selectedBranch = branches.find(b => b.name.toLowerCase() === branchName.toLowerCase() || b.id === branchId);
    if (selectedBranch) {
      setPastorName(selectedBranch.pastorName || '');
      setBranchId(selectedBranch.id);
    } else {
      // Find default pastor
      const pastors = usersList.filter(u => u.role === 'pastor');
      if (pastors.length > 0 && !pastorName) {
        setPastorName(pastors[0].name);
      }
    }
  }, [branchName, branchId, branches, usersList]);

  // Reset or Populate form for new report
  const handleCreateNewReport = () => {
    setEditingReportId(null);
    setBranchName(user?.branchName || (branches[0]?.name || 'GENUI – LOVE CHAPEL'));
    setMonth(MONTHS[new Date().getMonth()]);
    setYear(new Date().getFullYear().toString());
    
    // Default Sunday Attendance
    setSundayAttendance([
      { id: `sun-${Date.now()}`, date: new Date().toISOString().split('T')[0], children: 0, youth: 0, women: 0, men: 0, total: 0 }
    ]);
    
    // Default Weekdays
    setWeekdayAttendance([
      { id: `wk-1-${Date.now()}`, day: 'Tuesday', activity: 'Prayer Service', customActivity: '', children: 0, youth: 0, women: 0, men: 0 },
      { id: `wk-2-${Date.now()}`, day: 'Thursday', activity: 'Fasting & Prayers', customActivity: '', children: 0, youth: 0, women: 0, men: 0 },
      { id: `wk-3-${Date.now()}`, day: 'Friday', activity: 'Bible Studies', customActivity: '', children: 0, youth: 0, women: 0, men: 0 },
    ]);

    setFinance({
      tithes: '',
      sundayOfferings: '',
      weekdayOfferings: '',
      evangelismOffering: '',
      districtLevy: '',
      exchangeOfPulpit: '',
    });

    setSecretaryName(user?.name || 'Doris Tetteh');
    setSecretaryDate(new Date().toISOString().split('T')[0]);
    setSecretarySignature('');
    setActiveTab('new-report');
  };

  // Load existing report into form to edit
  const handleEditReport = (rep) => {
    setEditingReportId(rep.id);
    setBranchName(rep.branchName || '');
    setBranchId(rep.branchId || '');
    setMonth(rep.month || 'January');
    setYear(rep.year || '2026');
    setPastorName(rep.pastorName || '');
    setSundayAttendance(rep.sundayAttendance?.length > 0 ? rep.sundayAttendance : [
      { id: 'sun-1', date: '', children: 0, youth: 0, women: 0, men: 0, total: 0 }
    ]);
    setWeekdayAttendance(rep.weekdayAttendance?.length > 0 ? rep.weekdayAttendance : [
      { id: 'wk-1', day: 'Tuesday', activity: 'Prayer Service', customActivity: '', children: 0, youth: 0, women: 0, men: 0 }
    ]);
    setFinance({
      tithes: rep.finance?.tithes ?? '',
      sundayOfferings: rep.finance?.sundayOfferings ?? '',
      weekdayOfferings: rep.finance?.weekdayOfferings ?? '',
      evangelismOffering: rep.finance?.evangelismOffering ?? '',
      districtLevy: rep.finance?.districtLevy ?? '',
      exchangeOfPulpit: rep.finance?.exchangeOfPulpit ?? '',
    });
    setSecretaryName(rep.endorsement?.churchSecretary?.name || user?.name || '');
    setSecretaryDate(rep.endorsement?.churchSecretary?.date || new Date().toISOString().split('T')[0]);
    setSecretarySignature(rep.endorsement?.churchSecretary?.signatureData || '');
    setActiveTab('new-report');
  };

  // Sunday attendance handlers
  const addSundayRow = () => {
    setSundayAttendance(prev => [
      ...prev,
      { id: `sun-${Date.now()}`, date: '', children: '', youth: '', women: '', men: '', total: 0 }
    ]);
  };

  const removeSundayRow = (id) => {
    if (sundayAttendance.length <= 1) return;
    setSundayAttendance(prev => prev.filter(item => item.id !== id));
  };

  const updateSundayRow = (id, field, value) => {
    setSundayAttendance(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        const c = parseInt(updated.children) || 0;
        const y = parseInt(updated.youth) || 0;
        const w = parseInt(updated.women) || 0;
        const m = parseInt(updated.men) || 0;
        updated.total = c + y + w + m;
        return updated;
      }
      return item;
    }));
  };

  // Weekday attendance handlers
  const addWeekdayRow = () => {
    setWeekdayAttendance(prev => [
      ...prev,
      { id: `wk-${Date.now()}`, day: 'Tuesday', activity: 'Prayer Service', customActivity: '', children: '', youth: '', women: '', men: '' }
    ]);
  };

  const removeWeekdayRow = (id) => {
    if (weekdayAttendance.length <= 1) return;
    setWeekdayAttendance(prev => prev.filter(item => item.id !== id));
  };

  const updateWeekdayRow = (id, field, value) => {
    setWeekdayAttendance(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Calculate Grand Total for Finance
  const totalFinanceAmount = [
    parseFloat(finance.tithes) || 0,
    parseFloat(finance.sundayOfferings) || 0,
    parseFloat(finance.weekdayOfferings) || 0,
    parseFloat(finance.evangelismOffering) || 0,
    parseFloat(finance.districtLevy) || 0,
    parseFloat(finance.exchangeOfPulpit) || 0,
  ].reduce((acc, curr) => acc + curr, 0);

  // Form Submission Handlers
  const handleSaveDraft = async () => {
    await saveReportData('draft', 'Draft saved successfully!');
  };

  const handleSubmitToPastor = async () => {
    if (!secretarySignature) {
      const confirmProceed = window.confirm(
        'You have not added your digital signature/upload. Do you want to submit anyway?'
      );
      if (!confirmProceed) return;
    }
    await saveReportData('submitted_to_pastor', '🚀 Report submitted to Pastor for review & endorsement!');
  };

  const saveReportData = async (targetStatus, successMessage) => {
    setIsSubmitting(true);
    try {
      const payload = {
        branchName,
        branchId,
        month,
        year,
        pastorName,
        status: targetStatus,
        sundayAttendance,
        weekdayAttendance,
        finance: {
          tithes: parseFloat(finance.tithes) || 0,
          sundayOfferings: parseFloat(finance.sundayOfferings) || 0,
          weekdayOfferings: parseFloat(finance.weekdayOfferings) || 0,
          evangelismOffering: parseFloat(finance.evangelismOffering) || 0,
          districtLevy: parseFloat(finance.districtLevy) || 0,
          exchangeOfPulpit: parseFloat(finance.exchangeOfPulpit) || 0,
        },
        endorsement: {
          churchSecretary: {
            name: secretaryName,
            date: secretaryDate,
            signatureData: secretarySignature,
          }
        }
      };

      if (editingReportId) {
        if (targetStatus === 'submitted_to_pastor') {
          await api.submitReportToPastor(editingReportId, payload, user);
        } else {
          await api.updateReport(editingReportId, payload, user);
        }
      } else {
        await api.createReport(payload, user);
      }

      addNotification(successMessage, 'success');
      setActiveTab('submitted-entries');
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Error saving report: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter reports for this secretary's branch
  const filteredReports = reports.filter(r => {
    if (!user?.branchName) return true;
    return r.branchName?.toLowerCase() === user.branchName?.toLowerCase() ||
           r.branchId === user.branchId;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> Draft
          </span>
        );
      case 'submitted_to_pastor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Pending Pastor Review
          </span>
        );
      case 'endorsed':
      case 'approved_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Endorsed & Transmitted to Admin
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-serif">Church Secretary Portal</h2>
              <p className="text-xs text-slate-500">
                Logged in as <strong className="text-slate-800">{user?.name}</strong> • Branch: <strong className="text-emerald-800">{user?.branchName || branchName}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector & Create New Report Button */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <button
            onClick={() => setActiveTab('new-report')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'new-report'
                ? 'bg-blue-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>{editingReportId ? 'Edit Active Form' : 'Fill Monthly Report'}</span>
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
            <span>Submitted Entries ({filteredReports.length})</span>
          </button>

          <button
            onClick={handleCreateNewReport}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
            title="Start fresh blank report"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Report</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FILLABLE FORM */}
      {activeTab === 'new-report' && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-8 text-center border-b-4 border-amber-500">
            <h2 className="text-lg sm:text-2xl font-bold uppercase tracking-wider font-serif">
              ANLOGA DISTRICT RHEMA FULL GOSPEL CHURCHES
            </h2>
            <h3 className="text-base sm:text-lg font-bold uppercase text-amber-400 font-serif tracking-widest mt-0.5">
              MONTHLY REPORT FORM
            </h3>
            <p className="text-xs text-blue-200 mt-1 max-w-lg mx-auto">
              Please complete all attendance, weekday activity, and financial fields. Once submitted, this report will land directly in your Branch Pastor's Dashboard for review & endorsement.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">

            {/* SECTION 1: BRANCH, MONTH, PASTOR */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">1</span>
                <span>Branch & Reporting Period</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1a: Name of Branch */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    1. Name of Branch *
                  </label>
                  <select
                    value={branchName}
                    onChange={(e) => {
                      setBranchName(e.target.value);
                      const b = branches.find(br => br.name === e.target.value);
                      if (b) {
                        setBranchId(b.id);
                        setPastorName(b.pastorName || '');
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 1b: Month */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Month *
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 1g: Branch Pastor */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Branch Pastor *
                  </label>
                  <select
                    value={pastorName}
                    onChange={(e) => setPastorName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm"
                  >
                    {usersList
                      .filter(u => u.role === 'pastor')
                      .map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({p.branchName})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: SUNDAY ATTENDANCE */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">2</span>
                  <span>Sunday Attendance</span>
                </h4>

                {/* Add Sunday Button */}
                <button
                  type="button"
                  onClick={addSundayRow}
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD+ SUNDAY</span>
                </button>
              </div>

              {/* Sunday Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white font-bold rounded-lg overflow-hidden text-center">
                      <th className="py-2.5 px-3 text-left rounded-l-lg">Sunday Date</th>
                      <th className="py-2.5 px-2">Children</th>
                      <th className="py-2.5 px-2">Youth</th>
                      <th className="py-2.5 px-2">Women</th>
                      <th className="py-2.5 px-2">Men</th>
                      <th className="py-2.5 px-3 font-extrabold bg-blue-950">Total</th>
                      <th className="py-2.5 px-2 rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {sundayAttendance.map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-blue-50/40 transition">
                        {/* Date with Calendar Button */}
                        <td className="p-2 min-w-[160px]">
                          <div className="relative flex items-center">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => updateSundayRow(row.id, 'date', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
                              required
                            />
                            <Calendar className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none" />
                          </div>
                        </td>

                        {/* Children */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={row.children}
                            onChange={(e) => updateSundayRow(row.id, 'children', e.target.value)}
                            placeholder="0"
                            className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>

                        {/* Youth */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={row.youth}
                            onChange={(e) => updateSundayRow(row.id, 'youth', e.target.value)}
                            placeholder="0"
                            className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>

                        {/* Women */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={row.women}
                            onChange={(e) => updateSundayRow(row.id, 'women', e.target.value)}
                            placeholder="0"
                            className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>

                        {/* Men */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={row.men}
                            onChange={(e) => updateSundayRow(row.id, 'men', e.target.value)}
                            placeholder="0"
                            className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>

                        {/* Automatic Total Calculation */}
                        <td className="p-2 text-center bg-blue-50 font-extrabold text-blue-900">
                          {row.total || 0}
                        </td>

                        {/* Action */}
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeSundayRow(row.id)}
                            disabled={sundayAttendance.length <= 1}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-30"
                            title="Remove row"
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

            {/* SECTION 3: WEEK DAY ATTENDANCE */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">3</span>
                  <span>Week Day Attendance</span>
                </h4>

                {/* Add Weekday Row Button */}
                <button
                  type="button"
                  onClick={addWeekdayRow}
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD+ DAY</span>
                </button>
              </div>

              {/* Weekday Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white font-bold rounded-lg overflow-hidden text-center">
                      <th className="py-2.5 px-3 text-left rounded-l-lg">Day</th>
                      <th className="py-2.5 px-3 text-left min-w-[200px]">Activity</th>
                      <th className="py-2.5 px-2">Children</th>
                      <th className="py-2.5 px-2">Youth</th>
                      <th className="py-2.5 px-2">Women</th>
                      <th className="py-2.5 px-2">Men</th>
                      <th className="py-2.5 px-2 rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {weekdayAttendance.map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-blue-50/40 transition">
                        {/* Day Dropdown (Monday - Sunday) */}
                        <td className="p-2 min-w-[120px]">
                          <select
                            value={row.day}
                            onChange={(e) => updateWeekdayRow(row.id, 'day', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                          >
                            {DAYS_OF_WEEK.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </td>

                        {/* Activity Dropdown + Custom Input if "Others" */}
                        <td className="p-2">
                          <div className="space-y-1.5">
                            <select
                              value={row.activity}
                              onChange={(e) => updateWeekdayRow(row.id, 'activity', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                            >
                              {ACTIVITIES.map(a => (
                                <option key={a} value={a}>{a}</option>
                              ))}
                            </select>

                            {/* When Others is selected: display custom activity text placeholder */}
                            {row.activity === 'Others' && (
                              <input
                                type="text"
                                value={row.customActivity || ''}
                                onChange={(e) => updateWeekdayRow(row.id, 'customActivity', e.target.value)}
                                placeholder="Type custom activity name here..."
                                className="w-full bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 placeholder-amber-700/60 focus:bg-white focus:ring-2 focus:ring-amber-500"
                              />
                            )}
                          </div>
                        </td>

                        {/* Children */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={row.children}
                            onChange={(e) => updateWeekdayRow(row.id, 'children', e.target.value)}
                            placeholder="0"
                            className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>

                        {/* Youth */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={row.youth}
                            onChange={(e) => updateWeekdayRow(row.id, 'youth', e.target.value)}
                            placeholder="0"
                            className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>

                        {/* Women */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={row.women}
                            onChange={(e) => updateWeekdayRow(row.id, 'women', e.target.value)}
                            placeholder="0"
                            className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>

                        {/* Men */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={row.men}
                            onChange={(e) => updateWeekdayRow(row.id, 'men', e.target.value)}
                            placeholder="0"
                            className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg py-1.5 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>

                        {/* Action */}
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeWeekdayRow(row.id)}
                            disabled={weekdayAttendance.length <= 1}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-30"
                            title="Remove row"
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

            {/* SECTION 4: FINANCE */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">4</span>
                  <span>Finance (GH¢)</span>
                </h4>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium">Calculated Total: </span>
                  <span className="text-base font-extrabold text-blue-900">
                    GH₵ {totalFinanceAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* A. Tithes */}
                <div className="bg-white p-3.5 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    A. TITHES (GH¢)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">GH₵</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={finance.tithes}
                      onChange={(e) => setFinance(f => ({ ...f, tithes: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* D. Evangelism Offering */}
                <div className="bg-white p-3.5 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    D. EVANGELISM OFFERING (GH¢)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">GH₵</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={finance.evangelismOffering}
                      onChange={(e) => setFinance(f => ({ ...f, evangelismOffering: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* B. Sunday Offerings */}
                <div className="bg-white p-3.5 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    B. SUNDAY OFFERINGS (GH¢)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">GH₵</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={finance.sundayOfferings}
                      onChange={(e) => setFinance(f => ({ ...f, sundayOfferings: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* E. District Levy */}
                <div className="bg-white p-3.5 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E. DISTRICT LEVY (GH¢)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">GH₵</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={finance.districtLevy}
                      onChange={(e) => setFinance(f => ({ ...f, districtLevy: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* C. Week Day Offerings */}
                <div className="bg-white p-3.5 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    C. WEEK DAY OFFERINGS (GH¢)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">GH₵</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={finance.weekdayOfferings}
                      onChange={(e) => setFinance(f => ({ ...f, weekdayOfferings: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* F. Exchange of Pulpit */}
                <div className="bg-white p-3.5 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    F. EXCHANGE OF PULPIT (GH¢)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">GH₵</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={finance.exchangeOfPulpit}
                      onChange={(e) => setFinance(f => ({ ...f, exchangeOfPulpit: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: ENDORSEMENT (SECRETARY SECTION ONLY - STRICTLY NO PASTOR SECTION) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">5</span>
                <span>Church Secretary Endorsement</span>
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Church Secretary Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      A. Church Secretary Name *
                    </label>
                    <input
                      type="text"
                      value={secretaryName}
                      onChange={(e) => setSecretaryName(e.target.value)}
                      placeholder="Secretary Full Name"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm"
                      required
                    />
                  </div>

                  {/* Date with Calendar Button */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Date *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={secretaryDate}
                        onChange={(e) => setSecretaryDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm"
                        required
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Digital Signature Pad / Upload for Secretary */}
                <div>
                  <SignaturePad
                    value={secretarySignature}
                    onChange={(sig) => setSecretarySignature(sig)}
                    label="Church Secretary Digital Signature (Draw or Upload)"
                    signerRole="Secretary"
                    allowUpload={true}
                    allowDraw={true}
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save as In-Progress Draft</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitToPastor}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Submit to Pastor for Review & Endorsement'}</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: SUBMITTED ENTRIES */}
      {activeTab === 'submitted-entries' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">Submitted Reports & History</h3>
              <p className="text-xs text-slate-500">
                Track status of reports submitted for {user?.branchName || 'your branch'}.
              </p>
            </div>
            <button
              onClick={handleCreateNewReport}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Report</span>
            </button>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No reports recorded yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click "Create New Report" to fill and submit your branch's first monthly report.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Pastor</th>
                    <th className="py-3 px-4">Sundays</th>
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
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {rep.branchName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {rep.pastorName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {rep.sundayAttendance?.length || 0} Sundays
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        GH₵ {(parseFloat(rep.finance?.total) || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(rep.status)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedReportForView(rep)}
                            className="px-2.5 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                            title="View Official Report PDF"
                          >
                            <Eye className="w-3.5 h-3.5" /> View PDF
                          </button>
                          {rep.status === 'draft' && (
                            <button
                              onClick={() => handleEditReport(rep)}
                              className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                              title="Edit Draft"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                          )}
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
