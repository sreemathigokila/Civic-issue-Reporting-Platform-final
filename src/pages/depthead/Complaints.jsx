import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertTriangle, Download, FileText, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import PageHeader from '../../components/ui/PageHeader';
import AdminDownloadModal from '../../components/common/AdminDownloadModal';
import { formatComplaintId } from '../../utils/formatId';
import { getEffectiveStatus } from '../../utils/deadlineUtils';
import { exportComplaintsPDF } from '../../utils/pdfExport';
import api from '../../api/axios';

const statusFilters = ['All', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'SENT_FOR_VERIFICATION', 'RESOLVED'];

export default function DeptHeadComplaints() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  useEffect(() => {
    async function loadComplaints() {
      try {
        const response = await api.get('/complaints/depthead');
        const list = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        setComplaints(list);
      } catch (err) {
        console.error("Failed to load complaints", err);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, [profile]);

  const filtered = complaints.filter(c => {
    const codeStr = formatComplaintId(c).toLowerCase();
    const titleMatch = c.title ? c.title.toLowerCase().includes(search.toLowerCase()) : false;
    const codeMatch = codeStr.includes(search.toLowerCase());
    const locationMatch = (c.locationAddress || c.location) ? (c.locationAddress || c.location).toLowerCase().includes(search.toLowerCase()) : false;
    const matchSearch = !search || titleMatch || codeMatch || locationMatch;
    const effectiveStatus = getEffectiveStatus(c);
    const matchStatus = statusFilter === 'All' || c.status === statusFilter || effectiveStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const deptName = profile?.departmentName || profile?.department?.name || profile?.department || complaints[0]?.departmentName || complaints[0]?.department?.name || 'Electricity Dept';
  const distName = profile?.districtName || profile?.district?.name || profile?.district || complaints[0]?.districtName || complaints[0]?.district?.name || 'Cuddalore';

  function handleExecuteDownload(scope, dataToExport, options = {}) {
    const { selectedDate, selectedMonth, selectedYear } = options;
    let scopeName = 'All Department Complaints';
    if (scope === 'filtered') {
      scopeName = statusFilter === 'All' ? 'Filtered Complaints' : `Filtered (${statusFilter.replace(/_/g, ' ')})`;
    } else if (scope === 'date') {
      scopeName = `Complaints on Date: ${selectedDate || ''}`;
    } else if (scope === 'month') {
      scopeName = `Complaints in Month: ${selectedMonth || ''}`;
    } else if (scope === 'year') {
      scopeName = `Complaints in Year: ${selectedYear || ''}`;
    }

    exportComplaintsPDF({
      complaints: dataToExport,
      deptName: deptName,
      distName: distName,
      filterName: scopeName
    });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader 
        title="Complaints" 
        subtitle="Manage and track all reported civic issues" 
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Download size={16} /> Download Complaints
            </button>
            <Link to="/depthead/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              Department Overview
            </Link>
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
            placeholder="Search complaints..." 
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
            <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-50">
              <span>ID</span>
              <span>Issue</span>
              <span>Location</span>
              <span>Status</span>
              <span>Date</span>
              <span>Action</span>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map(c => {
                const effectiveStatus = getEffectiveStatus(c);
                return (
                  <div key={c.id} className="grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-2 sm:gap-4 items-center px-6 py-4">
                    <p className="font-bold text-blue-600 text-sm">{formatComplaintId(c)}</p>
                    <div className="flex items-center gap-2 truncate">
                      <p className="text-sm text-gray-700 truncate">{c.title}</p>
                      <PriorityBadge priority={c.priority || 'MEDIUM'} />
                    </div>
                    <p className="text-sm text-gray-500 truncate">{c.locationAddress || c.location || 'Coimbatore'}</p>
                    <StatusBadge status={effectiveStatus}/>
                    <p className="text-xs text-gray-400">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                    </p>
                    <Link to={`/depthead/complaints/${c.id}`} className="text-xs text-blue-600 font-medium hover:underline whitespace-nowrap">
                      View
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Download Complaints Report Modal with Filtered Records, All Records, By Date, By Month, By Year */}
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
                placeholder="Search by ID, title, location..." 
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusFilter === s ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
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
