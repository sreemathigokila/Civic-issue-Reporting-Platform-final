import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertTriangle, ShieldCheck, Download } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import PageHeader from '../../components/ui/PageHeader';
import AdminDownloadModal from '../../components/common/AdminDownloadModal';
import { formatComplaintId } from '../../utils/formatId';
import { getEffectiveStatus } from '../../utils/deadlineUtils';
import { exportAdminReport } from '../../utils/adminPdfExport';
import api from '../../api/axios';

const statusFilters = ['All', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'SENT_FOR_VERIFICATION', 'RESOLVED'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  useEffect(() => {
    async function loadComplaints() {
      try {
        const response = await api.get('/complaints');
        const list = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        setComplaints(list);
      } catch (err) {
        console.error("Failed to load admin complaints", err);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, []);

  const filtered = complaints.filter(c => {
    const codeStr = formatComplaintId(c).toLowerCase();
    const titleMatch = c.title ? c.title.toLowerCase().includes(search.toLowerCase()) : false;
    const codeMatch = codeStr.includes(search.toLowerCase());
    const citizenMatch = c.citizenName ? c.citizenName.toLowerCase().includes(search.toLowerCase()) : false;
    const locationMatch = (c.locationAddress || c.location) ? (c.locationAddress || c.location).toLowerCase().includes(search.toLowerCase()) : false;
    const matchSearch = !search || titleMatch || codeMatch || citizenMatch || locationMatch;
    const effectiveStatus = getEffectiveStatus(c);
    const matchStatus = statusFilter === 'All' || c.status === statusFilter || effectiveStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleExecuteDownload(scope, dataToExport, options = {}) {
    const { selectedDate, selectedMonth, selectedYear } = options;
    let filterDesc = 'All Complaints System View (Complete Dataset)';
    if (scope === 'filtered') {
      filterDesc = `Filtered Complaints (Status: ${statusFilter}, Search: "${search || 'None'}")`;
    } else if (scope === 'date') {
      filterDesc = `Complaints Submitted on Date: ${selectedDate || ''}`;
    } else if (scope === 'month') {
      filterDesc = `Complaints Submitted in Month: ${selectedMonth || ''}`;
    } else if (scope === 'year') {
      filterDesc = `Complaints Submitted in Year: ${selectedYear || ''}`;
    }

    exportAdminReport({
      title: 'Complaints System View',
      subtitle: filterDesc,
      filename: `CivicConnect_Complaints_${scope}.pdf`,
      data: dataToExport,
      columns: [
        { header: 'ID', accessor: c => formatComplaintId(c), bold: true },
        { header: 'Issue Title', accessor: c => c.title || 'Civic Issue' },
        { header: 'Citizen', accessor: c => c.citizenName || c.profile?.full_name || 'Citizen' },
        { header: 'Location', accessor: c => c.locationAddress || c.location || 'Coimbatore' },
        { header: 'Priority', accessor: c => c.priority || 'MEDIUM' },
        { header: 'Status', accessor: c => getEffectiveStatus(c).replace(/_/g, ' ') },
        { header: 'Submitted Date', accessor: c => c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently' },
      ]
    });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader 
        title="All Complaints System View" 
        subtitle="Global platform overview across all districts and departments" 
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Download size={16} /> Download Report
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              <ShieldCheck size={14}/> Admin Read-Only Monitor
            </span>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by ID, title, citizen, location..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {statusFilters.map(s => (
            <button 
              key={s} 
              onClick={() => setStatusFilter(s)} 
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <AlertTriangle size={32} className="mx-auto mb-2 opacity-40"/>
            <p className="text-sm">No complaints found</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-50 bg-slate-50/50">
              <span>ID</span>
              <span>Issue & Citizen</span>
              <span>Location</span>
              <span>Status</span>
              <span>Date</span>
              <span>Action</span>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map(c => (
                <div key={c.id} className="grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-2 sm:gap-4 items-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <p className="font-bold text-blue-600 text-sm">{formatComplaintId(c)}</p>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p>
                      <PriorityBadge priority={c.priority || 'MEDIUM'} />
                    </div>
                    <p className="text-xs text-gray-400">{c.citizenName || c.profile?.full_name || 'Citizen'}</p>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{c.locationAddress || c.location || 'Coimbatore'}</p>
                  <StatusBadge status={c.status}/>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                  </p>
                  <Link to={`/admin/complaints/${c.id}`} className="text-xs text-blue-600 font-bold hover:underline">
                    View
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AdminDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        pageTitle="Complaints"
        allData={complaints}
        filteredData={filtered}
        onDownload={handleExecuteDownload}
        filterControls={
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Search Query</label>
              <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search by ID, title, citizen, location..." 
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Status Filter</label>
              <div className="flex gap-1.5 flex-wrap">
                {statusFilters.map(s => (
                  <button 
                    type="button"
                    key={s} 
                    onClick={() => setStatusFilter(s)} 
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
