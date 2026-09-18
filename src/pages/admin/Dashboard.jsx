import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatComplaintId } from '../../utils/formatId';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, resolved: 0, inProgress: 0, departments: 7, workers: 7, citizens: 12 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const response = await api.get('/complaints/admin').catch(() => api.get('/complaints').catch(() => ({ data: [] })));
        const list = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        
        const resolved = list.filter(c => c.status === 'RESOLVED' || c.status === 'Resolved' || c.status === 'CLOSED' || c.status === 'Closed').length;
        const inProgress = list.filter(c => c.status === 'IN_PROGRESS' || c.status === 'In Progress' || c.status === 'ASSIGNED' || c.status === 'Assigned').length;
        
        setStats({
          total: list.length,
          resolved,
          inProgress,
          departments: 7,
          workers: 7,
          citizens: 12
        });
        setRecent(list.slice(0, 8));
      } catch (err) {
        console.error("Failed to load admin dashboard", err);
        setRecent([]);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const statCards = [
    { label: 'Total Complaints', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Departments', value: stats.departments, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Workers', value: stats.workers, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Citizens', value: stats.citizens, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader 
        title="Welcome back, Admin! 👋" 
        subtitle="System overview and management" 
        actions={
          <Link to="/admin/departments" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            Manage entities
          </Link>
        } 
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map(s => (<StatCard key={s.label} icon={s.icon} value={s.value} label={s.label} />))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Departments', to: '/admin/departments', color: 'bg-purple-600' },
          { label: 'Workers', to: '/admin/workers', color: 'bg-teal-600' },
          { label: 'Citizens', to: '/admin/citizens', color: 'bg-rose-600' },
          { label: 'Complaints', to: '/admin/complaints', color: 'bg-blue-600' },
        ].map(n => (
          <Link key={n.label} to={n.to} className={`${n.color} text-white rounded-2xl p-5 hover:opacity-90 transition-opacity font-semibold text-sm shadow-sm`}>
            {n.label} →
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Complaints</h2>
          <Link to="/admin/complaints" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : recent.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <AlertTriangle size={28} className="mx-auto mb-2 opacity-40"/>
            <p className="text-sm">No complaints yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(c => (
              <Link key={c.id} to={`/admin/complaints/${c.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5"><span className="font-bold text-blue-600">{formatComplaintId(c)}</span> · {c.locationAddress || c.location || 'Coimbatore'}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={c.status}/>
                  <span className="text-xs text-gray-400">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
