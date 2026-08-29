import React, { useRef, useState } from 'react';
import { Download, Printer, X, CheckCircle, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ReportPDFView = ({ report, onClose }) => {
  const printAreaRef = useRef(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  if (!report) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount) => {
    const val = parseFloat(amount) || 0;
    return `GH₵ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setGeneratingPdf(true);
    try {
      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      
      const cleanBranch = (report.branchName || 'Branch').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${cleanBranch}_${report.month}_${report.year}_Monthly_Report.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to print
      window.print();
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 md:p-6 flex justify-center">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-300 flex flex-col">
        {/* Top Action Bar (hidden on print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Official Monthly Report PDF Document</h3>
              <p className="text-xs text-slate-400">
                {report.branchName} — {report.month} {report.year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition flex items-center gap-1.5"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shadow-md flex items-center gap-1.5 disabled:opacity-50"
              title="Download as PDF file"
            >
              <Download className="w-3.5 h-3.5" />
              {generatingPdf ? 'Generating PDF...' : 'Download Official PDF'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition ml-2"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Exportable Canvas Page */}
        <div className="p-6 sm:p-10 md:p-12 overflow-y-auto bg-white" ref={printAreaRef}>
          <div className="max-w-[720px] mx-auto text-slate-900 bg-white leading-tight font-sans">
            
            {/* 1. Header */}
            <div className="text-center pb-4">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1B365D] uppercase font-serif">
                ANLOGA DISTRICT RHEMA FULL GOSPEL CHURCHES
              </h1>
              <h2 className="text-base sm:text-lg font-bold tracking-wider text-[#b45309] uppercase font-serif mt-0.5">
                MONTHLY REPORT
              </h2>

              {/* Sub-header Branch / Month / Pastor Box */}
              <div className="mt-3 py-1.5 px-3 border-y-2 border-[#1B365D] text-xs sm:text-sm font-semibold text-slate-800 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <span>Branch: <strong className="text-[#1B365D]">{report.branchName || '—'}</strong></span>
                <span className="text-slate-400">|</span>
                <span>Month: <strong className="text-[#1B365D]">{report.month || '—'} {report.year || ''}</strong></span>
                <span className="text-slate-400">|</span>
                <span>Pastor: <strong className="text-[#1B365D]">{report.pastorName || '—'}</strong></span>
              </div>
            </div>

            {/* 2. Sunday Attendance */}
            <div className="mt-4">
              <h3 className="text-sm font-bold text-[#1B365D] uppercase font-serif tracking-wide mb-1.5 border-b border-slate-200 pb-0.5">
                2. SUNDAY ATTENDANCE
              </h3>
              <table className="w-full border-collapse border border-slate-400 text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                    <th className="border border-slate-400 py-1.5 px-2 text-left">Date</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-center">Children</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-center">Youth</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-center">Women</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-center">Men</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-center font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.sundayAttendance || []).map((s, idx) => {
                    const c = parseInt(s.children) || 0;
                    const y = parseInt(s.youth) || 0;
                    const w = parseInt(s.women) || 0;
                    const m = parseInt(s.men) || 0;
                    const tot = s.total !== undefined ? s.total : (c + y + w + m);
                    return (
                      <tr key={s.id || idx} className="hover:bg-slate-50">
                        <td className="border border-slate-400 py-1.5 px-2 font-medium">
                          {formatDate(s.date) || `Sunday ${idx + 1}`}
                        </td>
                        <td className="border border-slate-400 py-1.5 px-2 text-center">{c}</td>
                        <td className="border border-slate-400 py-1.5 px-2 text-center">{y}</td>
                        <td className="border border-slate-400 py-1.5 px-2 text-center">{w}</td>
                        <td className="border border-slate-400 py-1.5 px-2 text-center">{m}</td>
                        <td className="border border-slate-400 py-1.5 px-2 text-center font-bold">{tot}</td>
                      </tr>
                    );
                  })}
                  {(!report.sundayAttendance || report.sundayAttendance.length === 0) && (
                    <tr>
                      <td colSpan={6} className="border border-slate-400 py-2 text-center text-slate-500 italic">
                        No Sunday attendance recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 3. Week Day Attendance */}
            <div className="mt-5">
              <h3 className="text-sm font-bold text-[#1B365D] uppercase font-serif tracking-wide mb-1.5 border-b border-slate-200 pb-0.5">
                3. WEEK DAY ATTENDANCE
              </h3>
              <table className="w-full border-collapse border border-slate-400 text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                    <th className="border border-slate-400 py-1.5 px-2 text-left">Day</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-left">Activity</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-center">Children</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-center">Youth</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-center">Women</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-center">Men</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.weekdayAttendance || []).map((w, idx) => {
                    const activityTitle = w.activity === 'Others' 
                      ? (w.customActivity || 'Others')
                      : (w.activity || 'Service');
                    return (
                      <tr key={w.id || idx} className="hover:bg-slate-50">
                        <td className="border border-slate-400 py-1.5 px-2 font-medium">{w.day}</td>
                        <td className="border border-slate-400 py-1.5 px-2">{activityTitle}</td>
                        <td className="border border-slate-400 py-1.5 px-2 text-center">{w.children || 0}</td>
                        <td className="border border-slate-400 py-1.5 px-2 text-center">{w.youth || 0}</td>
                        <td className="border border-slate-400 py-1.5 px-2 text-center">{w.women || 0}</td>
                        <td className="border border-slate-400 py-1.5 px-2 text-center">{w.men || 0}</td>
                      </tr>
                    );
                  })}
                  {(!report.weekdayAttendance || report.weekdayAttendance.length === 0) && (
                    <tr>
                      <td colSpan={6} className="border border-slate-400 py-2 text-center text-slate-500 italic">
                        No weekday activities recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. Finance */}
            <div className="mt-5">
              <h3 className="text-sm font-bold text-[#1B365D] uppercase font-serif tracking-wide mb-1.5 border-b border-slate-200 pb-0.5">
                4. FINANCE
              </h3>
              <table className="w-full border-collapse border border-slate-400 text-xs sm:text-sm">
                <tbody>
                  <tr>
                    <td className="border border-slate-400 py-1.5 px-2.5 font-medium w-1/4">A. Tithes</td>
                    <td className="border border-slate-400 py-1.5 px-2.5 font-bold w-1/4 text-right">
                      {formatCurrency(report.finance?.tithes)}
                    </td>
                    <td className="border border-slate-400 py-1.5 px-2.5 font-medium w-1/4">D. Evangelism Offering</td>
                    <td className="border border-slate-400 py-1.5 px-2.5 font-bold w-1/4 text-right">
                      {formatCurrency(report.finance?.evangelismOffering)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 py-1.5 px-2.5 font-medium">B. Sunday Offerings</td>
                    <td className="border border-slate-400 py-1.5 px-2.5 font-bold text-right">
                      {formatCurrency(report.finance?.sundayOfferings)}
                    </td>
                    <td className="border border-slate-400 py-1.5 px-2.5 font-medium">E. District Levy</td>
                    <td className="border border-slate-400 py-1.5 px-2.5 font-bold text-right">
                      {formatCurrency(report.finance?.districtLevy)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 py-1.5 px-2.5 font-medium">C. Week Day Offerings</td>
                    <td className="border border-slate-400 py-1.5 px-2.5 font-bold text-right">
                      {formatCurrency(report.finance?.weekdayOfferings)}
                    </td>
                    <td className="border border-slate-400 py-1.5 px-2.5 font-medium">F. Exchange of Pulpit</td>
                    <td className="border border-slate-400 py-1.5 px-2.5 font-bold text-right">
                      {formatCurrency(report.finance?.exchangeOfPulpit)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 5. Endorsement */}
            <div className="mt-5">
              <h3 className="text-sm font-bold text-[#1B365D] uppercase font-serif tracking-wide mb-2 border-b border-slate-200 pb-0.5">
                5. ENDORSEMENT
              </h3>

              <div className="space-y-4">
                {/* Secretary Endorsement */}
                <div>
                  <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm font-medium">
                    <p>
                      <strong>A. Church Secretary:</strong>{' '}
                      <span>{report.endorsement?.churchSecretary?.name || '—'}</span>
                    </p>
                    <p>
                      <strong>Date:</strong>{' '}
                      <span>{formatDate(report.endorsement?.churchSecretary?.date) || '—'}</span>
                    </p>
                  </div>
                  {report.endorsement?.churchSecretary?.signatureData ? (
                    <div className="mt-1 h-16 w-44 flex items-center">
                      <img
                        src={report.endorsement.churchSecretary.signatureData}
                        alt="Secretary Signature"
                        className="max-h-16 max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="mt-2 h-10 border-b border-dashed border-slate-400 w-48 text-[10px] text-slate-400 flex items-end">
                      (Secretary Signature)
                    </div>
                  )}
                </div>

                {/* Pastor Endorsement */}
                <div className="pt-2">
                  <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm font-medium">
                    <p>
                      <strong>B. Branch Pastor:</strong>{' '}
                      <span>{report.endorsement?.branchPastor?.name || report.pastorName || '—'}</span>
                    </p>
                    <p>
                      <strong>Date:</strong>{' '}
                      <span>{formatDate(report.endorsement?.branchPastor?.date) || '—'}</span>
                    </p>
                  </div>
                  {report.endorsement?.branchPastor?.signatureData ? (
                    <div className="mt-1 h-20 w-56 flex items-center">
                      <img
                        src={report.endorsement.branchPastor.signatureData}
                        alt="Branch Pastor Signature / Stamp"
                        className="max-h-20 max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="mt-2 h-10 border-b border-dashed border-slate-400 w-48 text-[10px] text-slate-400 flex items-end">
                      (Pastor Signature / Official Stamp)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[10px] sm:text-xs text-slate-500 font-sans space-y-0.5">
              <p className="font-medium text-slate-700">
                ANLOGA DISTRICT RHEMA FULL GOSPEL CHURCHES — Monthly Report
              </p>
              <p>
                Developed by <span className="font-semibold text-slate-800">V. C. Gbetodeme</span> | Contact:{' '}
                <span className="font-semibold text-slate-800">0243302919</span>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
