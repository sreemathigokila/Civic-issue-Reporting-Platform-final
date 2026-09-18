import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { formatComplaintId } from '../../utils/formatId';
import api from '../../api/axios';

export default function DeptHeadDashboard() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComplaints() {
      try {
        const response = await api.get('/complaints/depthead');
        const list = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        setComplaints(list);
      } catch (err) {
        console.error("Failed to load department head complaints", err);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, [profile]);

  const total = complaints.length;
  const assigned = complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'Assigned').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'Resolved').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'In Progress').length;

  const displayName = profile?.fullName || profile?.full_name || 'Department Head';

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader 
        title={`Welcome ${displayName.split(' ')[0]} 👋`} 
        subtitle="Department complaints overview" 
        badge={profile?.department || 'Department Head'} 
        actions={
          <Link to="/depthead/complaints" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            View all complaints
          </Link>
        } 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} value={total} label="Department Complaints" />
        <StatCard icon={Users} value={assigned} label="Assigned" />
        <StatCard icon={Clock} value={inProgress} label="In Progress" />
        <StatCard icon={CheckCircle2} value={resolved} label="Resolved" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Complaints</h2>
          <Link to="/depthead/complaints" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <AlertTriangle size={32} className="mx-auto mb-2 opacity-40"/>
            <p className="text-sm">No complaints in your department</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {complaints.slice(0, 8).map(c => (
              <Link key={c.id} to={`/depthead/complaints/${c.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                    <PriorityBadge priority={c.priority || 'MEDIUM'} />
                  </div>
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
