import { useState, useMemo } from 'react';
import { Download, FileText, Filter, Calendar, CalendarRange, X } from 'lucide-react';

function getItemDateStr(item) {
  if (!item) return '2021-05-12';
  const raw = item.joining_date || 
              item.joiningDate || 
              item.dateOfJoining ||
              item.date_of_joining ||
              item.createdAt || 
              item.created_at || 
              item.submittedDate || 
              item.member_since || 
              item.memberSince || 
              item.date || 
              item.createdAtDate;
  if (!raw) return '2021-05-12';
  if (typeof raw === 'string' && raw.includes('-')) {
    return raw.substring(0, 10); // 'YYYY-MM-DD'
  }
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '2021-05-12';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminDownloadModal({
  isOpen,
  onClose,
  pageTitle,
  allData = [],
  filteredData = [],
  filterControls = null,
  onDownload,
}) {
  const [scope, setScope] = useState('filtered'); // 'filtered' | 'all' | 'date' | 'month' | 'year'
  const [selectedDate, setSelectedDate] = useState('2026-01-15');
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [selectedYear, setSelectedYear] = useState('2026');

  const dateMatchingRecords = useMemo(() => {
    return allData.filter(item => getItemDateStr(item) === selectedDate);
  }, [allData, selectedDate]);

  const monthMatchingRecords = useMemo(() => {
    return allData.filter(item => getItemDateStr(item).startsWith(selectedMonth));
  }, [allData, selectedMonth]);

  const yearMatchingRecords = useMemo(() => {
    return allData.filter(item => getItemDateStr(item).startsWith(selectedYear));
  }, [allData, selectedYear]);

  if (!isOpen) return null;

  let exportData = filteredData;
  if (scope === 'all') exportData = allData;
  else if (scope === 'date') exportData = dateMatchingRecords;
  else if (scope === 'month') exportData = monthMatchingRecords;
  else if (scope === 'year') exportData = yearMatchingRecords;

  const exportCount = exportData.length;

  function handleConfirmDownload() {
    onDownload(scope, exportData, { selectedDate, selectedMonth, selectedYear });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 relative border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
              <Download size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Download {pageTitle} Report</h3>
              <p className="text-xs text-gray-500">Select report export scope & apply filters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scope Selector Options (Filtered, All, By Date, By Month, By Year) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setScope('filtered')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              scope === 'filtered'
                ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-100 shadow-sm'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div>
              <p className={`font-bold text-xs flex items-center gap-1.5 ${scope === 'filtered' ? 'text-purple-900' : 'text-gray-900'}`}>
                <Filter size={14} className={scope === 'filtered' ? 'text-purple-600' : 'text-gray-400'} /> Filtered Records
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Active page filters</p>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit mt-2 ${
              scope === 'filtered' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {filteredData.length} Records
            </span>
          </button>

          <button
            type="button"
            onClick={() => setScope('all')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              scope === 'all'
                ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-100 shadow-sm'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div>
              <p className={`font-bold text-xs flex items-center gap-1.5 ${scope === 'all' ? 'text-purple-900' : 'text-gray-900'}`}>
                <FileText size={14} className={scope === 'all' ? 'text-purple-600' : 'text-gray-400'} /> All Records
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Complete dataset</p>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit mt-2 ${
              scope === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {allData.length} Records
            </span>
          </button>

          <button
            type="button"
            onClick={() => setScope('date')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              scope === 'date'
                ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-100 shadow-sm'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div>
              <p className={`font-bold text-xs flex items-center gap-1.5 ${scope === 'date' ? 'text-purple-900' : 'text-gray-900'}`}>
                <Calendar size={14} className={scope === 'date' ? 'text-purple-600' : 'text-gray-400'} /> By Date
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Specific date</p>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit mt-2 ${
              scope === 'date' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {dateMatchingRecords.length} Records
            </span>
          </button>

          <button
            type="button"
            onClick={() => setScope('month')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              scope === 'month'
                ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-100 shadow-sm'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div>
              <p className={`font-bold text-xs flex items-center gap-1.5 ${scope === 'month' ? 'text-purple-900' : 'text-gray-900'}`}>
                <CalendarRange size={14} className={scope === 'month' ? 'text-purple-600' : 'text-gray-400'} /> By Month
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Month + year</p>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit mt-2 ${
              scope === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {monthMatchingRecords.length} Records
            </span>
          </button>

          <button
            type="button"
            onClick={() => setScope('year')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between col-span-2 sm:col-span-1 ${
              scope === 'year'
                ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-100 shadow-sm'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div>
              <p className={`font-bold text-xs flex items-center gap-1.5 ${scope === 'year' ? 'text-purple-900' : 'text-gray-900'}`}>
                <Calendar size={14} className={scope === 'year' ? 'text-purple-600' : 'text-gray-400'} /> By Year
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Specific year</p>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit mt-2 ${
              scope === 'year' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {yearMatchingRecords.length} Records
            </span>
          </button>
        </div>

        {/* Filter Controls for Filtered Records */}
        {scope === 'filtered' && filterControls && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={13} className="text-purple-600" /> Active Filter Controls
            </p>
            {filterControls}
          </div>
        )}

        {/* Date Picker Input when By Date is selected */}
        {scope === 'date' && (
          <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-4 space-y-2 animate-in fade-in duration-150">
            <label className="text-xs font-bold text-purple-950 block flex items-center gap-1.5">
              <Calendar size={14} className="text-purple-600" /> Select Specific Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>
        )}

        {/* Month Picker Input when By Month is selected */}
        {scope === 'month' && (
          <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-4 space-y-2 animate-in fade-in duration-150">
            <label className="text-xs font-bold text-purple-950 block flex items-center gap-1.5">
              <CalendarRange size={14} className="text-purple-600" /> Select Month & Year:
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>
        )}

        {/* Year Picker Input when By Year is selected */}
        {scope === 'year' && (
          <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-4 space-y-2 animate-in fade-in duration-150">
            <label className="text-xs font-bold text-purple-950 block flex items-center gap-1.5">
              <Calendar size={14} className="text-purple-600" /> Select Year:
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        )}

        {/* Footer info & Action Buttons */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Will export <strong>{exportCount}</strong> record{exportCount === 1 ? '' : 's'} as PDF.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDownload}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Download size={14} /> Download PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
