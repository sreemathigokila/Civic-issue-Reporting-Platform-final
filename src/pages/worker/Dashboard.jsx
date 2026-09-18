import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Wrench, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { formatComplaintId } from '../../utils/formatId';

export default function WorkerDashboard() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const assignedCount = tasks.filter(t => t.status === 'ASSIGNED' || t.status === 'Assigned').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'In Progress').length;
  const resolvedCount = tasks.filter(t => t.status === 'RESOLVED' || t.status === 'Resolved').length;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader 
        title={`Welcome back, ${profile?.fullName || profile?.name || 'Field Inspector'} 👋`} 
        subtitle="Manage assigned complaints and report resolution progress"
        actions={
          <Link to="/worker/tasks" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            View All Tasks
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Submitted" label="Submitted" value={assignedCount} icon={Clock} color="bg-amber-500 text-white" desc="Awaiting action"/>
        <StatCard title="Working" label="Working" value={inProgressCount} icon={Wrench} color="bg-blue-600 text-white" desc="Currently working"/>
        <StatCard title="Resolved" label="Resolved" value={resolvedCount} icon={CheckCircle2} color="bg-green-600 text-white" desc="Successfully completed"/>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-base">My Tasks</h2>
          <Link to="/worker/tasks" className="text-xs font-semibold text-purple-600 hover:text-purple-700">View all</Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Wrench size={32} className="mx-auto mb-2 opacity-40"/>
            <p className="text-sm">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tasks.map(t => {
              const code = formatComplaintId(t);
              const distName = t.districtName || t.district || 'Coimbatore';
              const deptName = t.departmentName || t.department || 'Road Maintenance';
              const catName = t.category || t.issueType || 'Civic Issue';
              const assignedByName = t.departmentHeadName || t.assignedBy || 'Dept Head';
              const assignedDate = t.updatedAt || t.createdAt;
              const dateStr = assignedDate ? new Date(assignedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently';

              return (
                <Link key={t.id} to={`/worker/tasks/${t.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-purple-50/40 transition-colors gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{code}</span>
                      <span className="text-xs text-purple-900 font-semibold bg-gray-100 px-2 py-0.5 rounded">{distName}</span>
                      <span className="text-xs text-purple-900 font-semibold bg-gray-100 px-2 py-0.5 rounded">{deptName}</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{t.title}</p>
                    <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{t.description}</p>
                    <div className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-3 flex-wrap">
                      <span>🏷️ <strong>Category:</strong> {catName}</span>
                      <span>👤 <strong>Assigned By:</strong> {assignedByName}</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <StatusBadge status={t.status}/>
                    <span className="text-xs text-gray-400">Assigned: {dateStr}</span>
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
