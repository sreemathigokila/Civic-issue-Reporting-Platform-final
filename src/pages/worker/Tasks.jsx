import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Search, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import { formatComplaintId } from '../../utils/formatId';
import { getEffectiveStatus } from '../../utils/deadlineUtils';

const statusFilters = ['All', 'Assigned', 'In Progress', 'Resolved'];

export default function WorkerTasks() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (!profile) return;
    api.get('/complaints/worker')
      .then(res => {
        setTasks(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setTasks([]);
        setLoading(false);
      });
  }, [profile]);

  const filtered = tasks.filter(t => {
    const code = formatComplaintId(t).toLowerCase();
    const title = t.title || '';
    const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase()) || code.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || (t.status && t.status.toLowerCase().replace('_', ' ') === statusFilter.toLowerCase());
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="My Tasks" 
        subtitle="View and manage your assigned complaints" 
        actions={
          <Link to="/worker/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            Dashboard
          </Link>
        } 
      />
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search complaints by ID or Title..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {statusFilters.map(s => (
            <button 
              key={s} 
              onClick={() => setStatusFilter(s)} 
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {s}
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
            <p className="text-sm">No tasks found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(t => {
              const deadline = t.workDeadline || t.work_deadline || '15/08/2026 05:00 PM';
              const effectiveStatus = getEffectiveStatus(t);
              return (
                <Link key={t.id} to={`/worker/tasks/${t.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-bold text-blue-600 text-sm">{formatComplaintId(t)}</p>
                    <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{t.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.locationAddress || t.location || 'Coimbatore'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={effectiveStatus}/>
                    <span className="text-xs text-gray-400">{t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</span>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 flex items-center gap-1">
                      <Clock size={11}/> {deadline}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
