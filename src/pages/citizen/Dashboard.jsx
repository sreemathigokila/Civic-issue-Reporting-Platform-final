import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Mic, FileText, Bell, TrendingUp, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { formatComplaintId } from '../../utils/formatId';
import api from '../../api/axios';

export default function CitizenDashboard() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComplaints() {
      try {
        const response = await api.get('/complaints/citizen');
        const list = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        setComplaints(list);
      } catch (err) {
        console.error("Failed to load citizen complaints", err);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, []);

  const reported = complaints.length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'Resolved').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'In Progress').length;

  const quickActions = [
    { label: 'Submit Complaint', to: '/citizen/submit', icon: Plus, color: 'bg-blue-600 text-white', desc: 'Fill in the details and AI will handle routing' },
    { label: 'Voice Complaint', to: '/citizen/voice', icon: Mic, color: 'bg-green-600 text-white', desc: 'Describe your issue by speaking' },
    { label: 'My Complaints', to: '/citizen/complaints', icon: FileText, color: 'bg-amber-500 text-white', desc: 'View and track your complaints' },
    { label: 'Notifications', to: '/citizen/notifications', icon: Bell, color: 'bg-purple-600 text-white', desc: 'Stay updated on your complaints' },
  ];

  const displayName = profile?.fullName || profile?.full_name || 'User';

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title={`Welcome back, ${displayName.split(' ')[0]} 👋`}
        subtitle="Here's what's happening in your area"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={TrendingUp} value={reported} label="Reported" />
        <StatCard icon={CheckCircle2} value={resolved} label="Resolved" />
        <StatCard icon={Clock} value={inProgress} label="In Progress" />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(a => (
            <Link key={a.label} to={a.to} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${a.color} group-hover:scale-110 transition-transform`}>
                <a.icon size={20}/>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{a.label}</p>
              <p className="text-xs text-gray-500 mt-1 leading-tight">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          <Link to="/citizen/complaints" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <AlertTriangle size={32} className="mx-auto mb-2 opacity-40"/>
            <p className="text-sm">No complaints yet. Submit your first issue!</p>
            <Link to="/citizen/submit" className="mt-3 inline-block text-blue-600 text-sm font-medium hover:underline">
              Report an Issue
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {complaints.slice(0, 5).map(c => (
              <Link key={c.id} to={`/citizen/complaints/${c.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5"><span className="font-semibold text-blue-600">{formatComplaintId(c)}</span> · {c.locationAddress || c.location_address || c.category || 'General'}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={c.status}/>
                  <span className="text-xs text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
