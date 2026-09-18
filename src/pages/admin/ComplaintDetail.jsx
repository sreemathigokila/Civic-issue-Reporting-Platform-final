import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Building2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ProgressTracker from '../../components/common/ProgressTracker';
import { formatComplaintId } from '../../utils/formatId';
import api from '../../api/axios';

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      try {
        const complaintRes = await api.get(`/complaints/${id}`);
        setComplaint(complaintRes.data);
      } catch (err) {
        console.error("Failed to load admin complaint detail", err);
        setComplaint(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (!complaint) {
    return <div className="text-center py-12 text-gray-500">Complaint not found</div>;
  }

  const complaintCode = formatComplaintId(complaint);

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={complaint.title}
        subtitle="Review complaint details and tracking progress"
        badge={complaint.status}
        actions={
          <Link to="/admin/complaints" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors">
            <ArrowLeft size={16}/> Back to Complaints
          </Link>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">{complaint.title}</h1>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={complaint.priority || 'MEDIUM'} />
              <StatusBadge status={complaint.status}/>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Complaint ID</p>
            <p className="font-bold text-blue-600 text-base">{complaintCode}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Issue Type</p>
            <p className="font-semibold text-gray-900">{(complaint.category || 'General').replace(/COMMIT;/gi, '').trim()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Location</p>
            <div className="flex items-center gap-1">
              <MapPin size={13} className="text-gray-400"/>
              <p className="font-semibold text-gray-900 text-sm">{complaint.locationAddress || complaint.location || 'Coimbatore'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Submitted On</p>
            <div className="flex items-center gap-1">
              <Calendar size={13} className="text-gray-400"/>
              <p className="font-semibold text-gray-900 text-sm">
                {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Submitted By</p>
            <p className="font-semibold text-gray-900 text-sm">{complaint.citizenName || 'Citizen'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Assigned Worker</p>
            <p className="font-semibold text-gray-900 text-sm">{complaint.workerName || 'Unassigned'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Department</p>
            <div className="flex items-center gap-1">
              <Building2 size={13} className="text-gray-400"/>
              <p className="font-semibold text-gray-900 text-sm">{complaint.departmentName || complaint.assignedDepartment || 'Unassigned'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4">Progress Status</h2>
        <ProgressTracker status={complaint.status}/>
      </div>
    </div>
  );
}
