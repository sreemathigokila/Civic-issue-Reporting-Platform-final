import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import { formatComplaintId } from '../../utils/formatId';
import api from '../../api/axios';

const statusFilters = ['All', 'SUBMITTED', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function MyComplaints() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    setLoading(true);
    try {
      const res = await api.get('/complaints/citizen');
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setComplaints(list);
    } catch (err) {
      console.error("Failed to load citizen complaints", err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = complaints.filter(c => {
    const codeStr = formatComplaintId(c).toLowerCase();
    const titleMatch = c.title ? c.title.toLowerCase().includes(search.toLowerCase()) : false;
    const codeMatch = codeStr.includes(search.toLowerCase());
    const matchSearch = !search || titleMatch || codeMatch;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function handleDelete(id) {
    if (!window.confirm('Delete this complaint? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/complaints/${id}`);
      setComplaints(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Failed to delete complaint", err);
      alert(err.response?.data?.message || 'Unable to delete complaint.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader 
        title="My Complaints" 
        subtitle="View all the issues you have reported" 
        actions={
          <div className="flex gap-2">
            <button
              onClick={loadComplaints}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/citizen/submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
              Submit New Issue
            </Link>
          </div>
        } 
      />

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Type here to search by ID or Title..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {statusFilters.map(s => (
            <button 
              key={s} 
              onClick={() => setStatusFilter(s)} 
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
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
            <p className="text-sm font-medium">No complaints found</p>
            <Link to="/citizen/submit" className="mt-3 inline-block text-blue-600 text-sm font-semibold hover:underline">
              Report an Issue
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[minmax(260px,2.5fr)_minmax(180px,1.5fr)_140px_110px_130px] gap-4 px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50/50 items-center">
              <span className="text-left">ID / Issue</span>
              <span className="text-left">Location</span>
              <span className="text-center">Status</span>
              <span className="text-center">Date</span>
              <span className="text-center">Action</span>
            </div>
            <div className="divide-y divide-gray-100">
              {filtered.map(c => {
                const code = formatComplaintId(c);
                return (
                  <div key={c.id} className="grid grid-cols-1 sm:grid-cols-[minmax(260px,2.5fr)_minmax(180px,1.5fr)_140px_110px_130px] gap-2 sm:gap-4 items-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="pr-2">
                      <p className="font-bold text-blue-600 text-sm">{code}</p>
                      <p className="text-xs text-gray-800 font-semibold mt-0.5 break-words">{c.title}</p>
                    </div>
                    <p className="text-xs text-gray-600 font-medium break-words pr-2">{c.locationAddress || c.location_address || c.category || 'General'}</p>
                    <div className="flex justify-center">
                      <StatusBadge status={c.status}/>
                    </div>
                    <p className="text-xs text-gray-500 whitespace-nowrap font-medium text-center">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                    </p>
                    <div className="flex gap-3 items-center justify-center">
                      <Link to={`/citizen/complaints/${c.id}`} className="text-xs text-blue-600 font-bold hover:underline">
                        View
                      </Link>
                      {c.status === "SUBMITTED" && (
                        <button 
                          type="button" 
                          onClick={() => handleDelete(c.id)} 
                          disabled={deletingId === c.id} 
                          className="text-xs text-red-600 font-medium hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          <Trash2 size={13}/> Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
