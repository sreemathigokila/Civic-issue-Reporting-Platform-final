import { useEffect, useState } from 'react';
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Building2, Upload, X, Loader2, CheckCircle2, Clock } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressTracker from '../../components/common/ProgressTracker';
import PageHeader from '../../components/ui/PageHeader';
import { formatComplaintId } from '../../utils/formatId';
import { getEffectiveStatus } from '../../utils/deadlineUtils';

function formatDeadline(dl) {
  if (!dl) return null;
  return dl;
}

export default function WorkerTaskDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [afterFile, setAfterFile] = useState(null);
  const [afterPreview, setAfterPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/complaints/${id}`)
      .then(res => {
        setComplaint(res.data);
        setRemarks(res.data?.workerRemarks || res.data?.worker_remarks || '');
        setLoading(false);
      })
      .catch(() => {
        setComplaint(null);
        setLoading(false);
      });
  }, [id]);

  function handleAfterPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAfterFile(file);
    setAfterPreview(URL.createObjectURL(file));
  }

  async function startWork() {
    if (!complaint) return;
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/complaints/${complaint.id}/status?status=IN_PROGRESS&remarks=Worker+started+work`);
      setComplaint(res.data || { ...complaint, status: 'IN_PROGRESS' });
    } catch (err) {
      console.error("Failed to start work", err);
      try {
        const formData = new FormData();
        formData.append('status', 'IN_PROGRESS');
        formData.append('remarks', 'Worker started working on this complaint.');
        const res = await api.put(`/complaints/${complaint.id}/status`, formData);
        setComplaint(res.data || { ...complaint, status: 'IN_PROGRESS' });
      } catch (fallbackErr) {
        console.error("Fallback start work failed", fallbackErr);
      }
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function submitForReview() {
    if (!complaint) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('remarks', remarks || 'Work completed and submitted for review.');
      if (afterFile) {
        formData.append('image', afterFile);
        formData.append('afterImage', afterFile);
      }

      const res = await api.put(`/complaints/${complaint.id}/status?status=SENT_FOR_VERIFICATION`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setComplaint(res.data || { ...complaint, status: 'SENT_FOR_VERIFICATION' });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit review via FormData, trying query params fallback...", err);
      try {
        const url = `/complaints/${complaint.id}/status?status=SENT_FOR_VERIFICATION&remarks=${encodeURIComponent(remarks || 'Work completed')}`;
        const fallbackRes = await api.put(url);
        setComplaint(fallbackRes.data || { ...complaint, status: 'SENT_FOR_VERIFICATION' });
        setSubmitted(true);
      } catch (fallbackErr) {
        console.error("Fallback submit review failed", fallbackErr);
        alert("Failed to submit review. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;
  if (!complaint) return <div className="text-center py-12 text-gray-500">Task not found</div>;
  
  const effectiveStatus = getEffectiveStatus(complaint);
  const complaintCode = formatComplaintId(complaint);
  const cleanCategory = (complaint.category || 'General').replace(/COMMIT;/gi, '').trim();

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={complaint.title}
        subtitle="Task details and completion workflow"
        badge={effectiveStatus}
        actions={
          <Link to="/worker/tasks" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors">
            <ArrowLeft size={16}/> Back to Tasks
          </Link>
        }
      />
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <p className="text-sm text-blue-200 mb-1">Complaint Details</p>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">{complaint.title}</h1>
            <StatusBadge status={effectiveStatus}/>
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Complaint ID</p>
            <p className="font-bold text-blue-600 text-base">{complaintCode}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Issue Type</p>
            <p className="font-semibold text-gray-900">{cleanCategory}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Location</p>
            <div className="flex items-center gap-1"><MapPin size={13} className="text-gray-400"/><p className="font-semibold text-gray-900 text-sm">{complaint.locationAddress || complaint.location || 'N/A'}</p></div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Submitted On</p>
            <div className="flex items-center gap-1"><Calendar size={13} className="text-gray-400"/><p className="font-semibold text-gray-900 text-sm">{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</p></div>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Assigned Department</p>
            <div className="flex items-center gap-1"><Building2 size={13} className="text-gray-400"/><p className="font-semibold text-gray-900 text-sm">{complaint.departmentName || complaint.department?.name || 'Road Maintenance'}</p></div>
          </div>
          <div className="col-span-2 bg-purple-50/60 p-3 rounded-xl border border-purple-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-0.5">Work Deadline</p>
              <div className="flex items-center gap-1.5">
                <Clock size={15} className="text-purple-600 shrink-0"/>
                <p className="font-extrabold text-purple-950 text-sm">
                  {complaint.workDeadline || complaint.work_deadline || '15/08/2026 05:00 PM'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
              Required Completion
            </span>
          </div>
          {complaint.description && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-gray-700">{complaint.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4">Progress Status</h2>
        <ProgressTracker status={effectiveStatus}/>
      </div>

      {(effectiveStatus === 'SENT_FOR_VERIFICATION' || effectiveStatus === 'SUBMITTED_FOR_REVIEW') && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-5 flex items-center gap-4">
          <Clock size={28} className="text-purple-600 shrink-0"/>
          <div>
            <h3 className="font-bold text-purple-950 text-base">Sent for Verification</h3>
            <p className="text-sm text-purple-800 mt-1">Your work has been submitted for review. Waiting for Department Head approval.</p>
          </div>
        </div>
      )}

      {(effectiveStatus === 'ASSIGNED' || effectiveStatus === 'Assigned' || effectiveStatus === 'PENDING' || effectiveStatus === 'Pending') && (
        <button onClick={startWork} disabled={updatingStatus} className="w-full bg-amber-500 text-white font-semibold py-3 rounded-xl hover:bg-amber-600 disabled:opacity-60 mb-5 flex items-center justify-center gap-2">
          {updatingStatus ? <><Loader2 size={16} className="animate-spin"/>Starting...</> : 'Start Working on This Task'}
        </button>
      )}

      {(effectiveStatus === 'IN_PROGRESS' || effectiveStatus === 'In Progress') && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">Review & Finalize</h2>
          <p className="text-sm text-gray-500 mb-4">Please confirm the task details before submitting for review.</p>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">After Photo</label>
            {afterPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={afterPreview} alt="after" className="w-full h-40 object-cover"/>
                <button onClick={() => { setAfterFile(null); setAfterPreview(''); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1">
                  <X size={14}/>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload size={20} className="text-gray-400"/>
                <p className="text-sm text-gray-500">Upload after photo</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleAfterPhoto}/>
              </label>
            )}
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Final Remarks</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={4} maxLength={500} placeholder="Describe the work performed or any follow-up actions required..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
            <p className="text-xs text-gray-400 text-right mt-1">{remarks.length}/500</p>
          </div>
          <button onClick={submitForReview} disabled={submitting} className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 size={16} className="animate-spin"/>Submitting...</> : 'Send for Review'}
          </button>
        </div>
      )}
    </div>
  );
}
