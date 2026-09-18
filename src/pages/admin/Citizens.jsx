import { useEffect, useState } from 'react';
import { Search, AlertTriangle, Download, FileText, Calendar, CalendarRange, Filter, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { exportAdminReport } from '../../utils/adminPdfExport';
import api from '../../api/axios';

const defaultCitizens = [
  { id: 1, full_name: 'Sanjay', email: 'sanjay@gmail.com', mobile: '9489122292', city: 'Coimbatore', member_since: '2026-02-01' },
  { id: 2, full_name: 'Pradeepa', email: 'pradeepa@gmail.com', mobile: '8122671800', city: 'Coimbatore', member_since: '2026-01-15' },
  { id: 3, full_name: 'Gokila', email: 'gokila@gmail.com', mobile: '8489638230', city: 'Coimbatore', member_since: '2026-01-20' },
];

export default function AdminCitizens() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Modal Download Filter Options: 'all' | 'date' | 'month' | 'year'
  const [dateFilterType, setDateFilterType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2026-01-15');
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [selectedYear, setSelectedYear] = useState('2026');

  useEffect(() => {
    async function loadCitizens() {
      try {
        const res = await api.get('/admin/citizens').catch(() => ({ data: defaultCitizens }));
        const list = Array.isArray(res.data) && res.data.length > 0 ? res.data : defaultCitizens;
        setCitizens(list);
      } catch (err) {
        console.error("Failed to load citizens", err);
        setCitizens(defaultCitizens);
      } finally {
        setLoading(false);
      }
    }
    loadCitizens();
  }, []);

  const filtered = citizens.filter(c => {
    const nameStr = c.full_name || c.fullName || '';
    const emailStr = c.email || '';
    return !search || nameStr.toLowerCase().includes(search.toLowerCase()) || emailStr.toLowerCase().includes(search.toLowerCase());
  });

  const getCitizenDateStr = (c) => {
    const raw = c.member_since || c.createdAt || c.memberSince;
    if (!raw) return '';
    if (typeof raw === 'string' && raw.includes('-')) {
      return raw.substring(0, 10);
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getFilteredCitizensForDownload = () => {
    if (dateFilterType === 'all') {
      return citizens;
    }
    if (dateFilterType === 'date') {
      return citizens.filter(c => getCitizenDateStr(c) === selectedDate);
    }
    if (dateFilterType === 'month') {
      return citizens.filter(c => getCitizenDateStr(c).startsWith(selectedMonth));
    }
    if (dateFilterType === 'year') {
      return citizens.filter(c => getCitizenDateStr(c).startsWith(selectedYear));
    }
    return citizens;
  };

  const matchingRecords = getFilteredCitizensForDownload();

  function handleExecuteDownload() {
    const records = getFilteredCitizensForDownload();
    let filterDesc = 'All Registered Citizens (Complete Dataset)';
    if (dateFilterType === 'date') {
      filterDesc = `Citizens Registered on Date: ${selectedDate}`;
    } else if (dateFilterType === 'month') {
      filterDesc = `Citizens Registered in Month: ${selectedMonth}`;
    } else if (dateFilterType === 'year') {
      filterDesc = `Citizens Registered in Year: ${selectedYear}`;
    }

    exportAdminReport({
      title: 'Citizens Management Report',
      subtitle: filterDesc,
      filename: `CivicConnect_Citizens_${dateFilterType}_Report.pdf`,
      data: records,
      columns: [
        { header: 'Full Name', accessor: c => c.full_name || c.fullName, bold: true },
        { header: 'Email Address', accessor: c => c.email },
        { header: 'Mobile Number', accessor: c => c.mobile || '—' },
        { header: 'City / District', accessor: c => c.city || c.districtName || 'Coimbatore' },
        { header: 'Member Since', accessor: c => c.member_since || c.createdAt ? new Date(c.member_since || c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently' },
      ]
    });
    setIsDownloadModalOpen(false);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader 
        title="Citizens" 
        subtitle="Manage registered citizens" 
        actions={
          <button
            type="button"
            onClick={() => setIsDownloadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Download size={16} /> Download Report
          </button>
        }
      />

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input 
          type="text" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search citizens..." 
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <AlertTriangle size={28} className="mx-auto mb-2 opacity-40"/>
            <p className="text-sm">No citizens found</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-50">
              <span>Name</span>
              <span>Email</span>
              <span>Mobile</span>
              <span>City</span>
              <span>Member Since</span>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map(c => (
                <div key={c.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 sm:gap-4 items-center px-6 py-4">
                  <p className="font-semibold text-gray-900 text-sm">{c.full_name || c.fullName}</p>
                  <p className="text-sm text-gray-500 truncate">{c.email}</p>
                  <p className="text-sm text-gray-500">{c.mobile || '—'}</p>
                  <p className="text-sm text-gray-500">{c.city || c.districtName || 'Coimbatore'}</p>
                  <p className="text-xs text-gray-400">
                    {c.member_since || c.createdAt ? new Date(c.member_since || c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Citizens Download Report Modal with All Citizens, By Date, By Month, and By Year Options */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-6 relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-xs">
                  <Download size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Download Citizens Report</h3>
                  <p className="text-xs text-gray-500">Select report filter scope & download PDF</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDateFilterType('all')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dateFilterType === 'all'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100 shadow-sm'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <p className={`font-bold text-xs flex items-center gap-1.5 ${dateFilterType === 'all' ? 'text-blue-900' : 'text-gray-900'}`}>
                  <FileText size={14} className={dateFilterType === 'all' ? 'text-blue-600' : 'text-gray-400'} /> All Citizens
                </p>
                <p className="text-[11px] text-gray-500 mt-1">Export all records</p>
              </button>

              <button
                type="button"
                onClick={() => setDateFilterType('date')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dateFilterType === 'date'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100 shadow-sm'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <p className={`font-bold text-xs flex items-center gap-1.5 ${dateFilterType === 'date' ? 'text-blue-900' : 'text-gray-900'}`}>
                  <Calendar size={14} className={dateFilterType === 'date' ? 'text-blue-600' : 'text-gray-400'} /> By Date
                </p>
                <p className="text-[11px] text-gray-500 mt-1">Select specific date</p>
              </button>

              <button
                type="button"
                onClick={() => setDateFilterType('month')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dateFilterType === 'month'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100 shadow-sm'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <p className={`font-bold text-xs flex items-center gap-1.5 ${dateFilterType === 'month' ? 'text-blue-900' : 'text-gray-900'}`}>
                  <CalendarRange size={14} className={dateFilterType === 'month' ? 'text-blue-600' : 'text-gray-400'} /> By Month
                </p>
                <p className="text-[11px] text-gray-500 mt-1">Select month + year</p>
              </button>

              <button
                type="button"
                onClick={() => setDateFilterType('year')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dateFilterType === 'year'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100 shadow-sm'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <p className={`font-bold text-xs flex items-center gap-1.5 ${dateFilterType === 'year' ? 'text-blue-900' : 'text-gray-900'}`}>
                  <Filter size={14} className={dateFilterType === 'year' ? 'text-blue-600' : 'text-gray-400'} /> By Year
                </p>
                <p className="text-[11px] text-gray-500 mt-1">Select specific year</p>
              </button>
            </div>

            {/* Inputs depending on filter selection */}
            {dateFilterType === 'date' && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Select Specific Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {dateFilterType === 'month' && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Select Month & Year:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {dateFilterType === 'year' && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Select Registration Year:</label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                Will export <strong>{matchingRecords.length}</strong> matching record{matchingRecords.length === 1 ? '' : 's'}.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDownload}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
