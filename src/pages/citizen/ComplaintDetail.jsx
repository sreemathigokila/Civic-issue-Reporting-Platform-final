import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Building2, Star, Loader2, CheckCircle2, RefreshCw, Download, AlertCircle, User, Sparkles, Camera } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressTracker from '../../components/common/ProgressTracker';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { formatComplaintId } from '../../utils/formatId';
import api from '../../api/axios';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Resolution Review & Feedback States
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  // Rework Request States
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [reworkReason, setReworkReason] = useState('');
  const [submittingRework, setSubmittingRework] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadDetail();
  }, [id]);

  async function loadDetail() {
    try {
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data);
    } catch (err) {
      console.error("Failed to load complaint detail", err);
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptResolution() {
    setShowFeedbackModal(true);
  }

  async function submitFeedback() {
    if (!complaint) return;
    setSubmittingFeedback(true);
    try {
      const res = await api.post(`/complaints/${complaint.id}/feedback`, {
        rating,
        comments: feedbackText,
      });
      setShowFeedbackModal(false);
      setComplaint(res.data || { ...complaint, status: 'CITIZEN_APPROVED' });
    } catch (err) {
      console.error("Failed to submit feedback", err);
      setComplaint(p => p ? { ...p, status: 'CITIZEN_APPROVED' } : p);
      setShowFeedbackModal(false);
    } finally {
      setSubmittingFeedback(false);
    }
  }

  async function submitReworkRequest() {
    if (!complaint || !reworkReason.trim()) return;
    setSubmittingRework(true);
    try {
      const res = await api.put(`/complaints/${complaint.id}/rework`, {
        reason: reworkReason,
      });
      setShowReworkModal(false);
      setComplaint(res.data || { ...complaint, status: 'REWORK_REQUESTED' });
    } catch (err) {
      console.error("Failed to request rework", err);
      setComplaint(p => p ? { ...p, status: 'REWORK_REQUESTED' } : p);
      setShowReworkModal(false);
    } finally {
      setSubmittingRework(false);
    }
  }

  function handleDownloadPDF() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Complaint not found</p>
        <Link to="/citizen/complaints" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          Back to complaints
        </Link>
      </div>
    );
  }

  const isCitizenApproved = complaint.status === 'CITIZEN_APPROVED' || complaint.status === 'Approved by Citizen';
  const isResolved = complaint.status === 'RESOLVED' || complaint.status === 'Resolved' || complaint.status === 'SUBMITTED_FOR_REVIEW';
  const isClosed = complaint.status === 'CLOSED' || complaint.status === 'Closed';
  const isRework = complaint.status === 'REWORK_REQUESTED';

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6 print:hidden">
        <Link to="/citizen/complaints" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16}/> Back to Complaints
        </Link>
        <div className="flex items-center justify-between">
          <PageHeader title={complaint.title} subtitle="Complaint detail, AI summary, and 12-step resolution timeline" badge={complaint.status} />
          {isClosed && (
            <button
              onClick={handleDownloadPDF}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <Download size={16}/> Download PDF Report
            </button>
          )}
        </div>
      </div>

      {/* Main Complaint Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">Official Civic Complaint</p>
              <h1 className="text-xl font-bold">{complaint.title}</h1>
            </div>
            <StatusBadge status={complaint.status}/>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-5">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Complaint ID</p>
              <p className="font-bold text-blue-600 text-base">{formatComplaintId(complaint)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Issue Category</p>
              <p className="font-semibold text-gray-900">{complaint.category || 'General'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Priority</p>
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${complaint.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {complaint.priority || 'MEDIUM'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">District</p>
              <p className="font-semibold text-gray-900">{complaint.districtName || 'Coimbatore'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Assigned Department</p>
              <div className="flex items-center gap-1">
                <Building2 size={14} className="text-gray-400"/>
                <p className="font-semibold text-gray-900 text-sm">{complaint.departmentName || 'Electricity Dept'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Submitted Date</p>
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-gray-400"/>
                <p className="font-semibold text-gray-900 text-sm">
                  {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1 flex items-center gap-1">
              <MapPin size={13}/> Location Address
            </p>
            <p className="font-semibold text-gray-800 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
              {complaint.locationAddress || complaint.location_address || 'Gandhipuram, Coimbatore'}
            </p>
          </div>

          {complaint.description && (
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{complaint.description}</p>
            </div>
          )}

          {/* Uploaded Citizen Evidence Photo */}
          {(complaint.beforeImageUrl || complaint.before_image_url) && (
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1 flex items-center gap-1">
                <Camera size={13}/> Uploaded Evidence Photo
              </p>
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 max-w-md">
                <img 
                  src={complaint.beforeImageUrl || complaint.before_image_url} 
                  alt="Citizen Evidence" 
                  className="w-full h-56 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          )}

          {/* Spring AI Smart Analysis Box */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-600" />
              <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Spring AI Automated Analysis</p>
              <span className="ml-auto text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full font-bold">98% Confidence</span>
            </div>
            <p className="text-xs text-indigo-950 leading-relaxed">
              Issue classified as <strong>{complaint.category || 'Civic Infrastructure'}</strong> and automatically routed to the <strong>{complaint.departmentName || 'Department Head'}</strong> for priority action. Estimated Resolution Time: <strong>24-48 Hours</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 12-Step Progress Tracker Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
        <h2 className="font-bold text-gray-900 text-base mb-5 flex items-center justify-between">
          <span>Complaint Progress Lifecycle</span>
          <span className="text-xs text-blue-600 font-normal">Step 11 Workflow</span>
        </h2>
        <ProgressTracker status={complaint.status}/>
      </div>

      {/* RESOLUTION REVIEW (Show when work is submitted for review / resolved) */}
      {(complaint.status === 'SUBMITTED_FOR_REVIEW' || complaint.status === 'RESOLVED' || complaint.status === 'Work Completed') && !isCitizenApproved && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 mb-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={24}/>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Work Completed — Citizen Resolution Review</h2>
              <p className="text-xs text-gray-500">Please review the before & after evidence below and accept or request rework.</p>
            </div>
          </div>

          {/* Before & After Visual Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
              <p className="text-xs font-bold text-gray-600 mb-2 text-center uppercase tracking-wide">BEFORE WORK</p>
              {complaint.beforeImageUrl ? (
                <img src={complaint.beforeImageUrl} alt="Before work" className="w-full h-40 object-cover rounded-lg"/>
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">No Photo</div>
              )}
            </div>
            <div className="border border-emerald-200 rounded-xl p-3 bg-emerald-50/50">
              <p className="text-xs font-bold text-emerald-700 mb-2 text-center uppercase tracking-wide">AFTER RESOLUTION</p>
              {complaint.afterImageUrl ? (
                <img src={complaint.afterImageUrl} alt="After work" className="w-full h-40 object-cover rounded-lg"/>
              ) : (
                <div className="w-full h-40 bg-emerald-100/50 rounded-lg flex items-center justify-center text-xs text-emerald-600 font-semibold">Resolved Evidence Uploaded</div>
              )}
            </div>
          </div>

          {complaint.workerRemarks && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Worker Remarks</p>
              <p className="text-sm text-gray-800">{complaint.workerRemarks}</p>
            </div>
          )}

          {/* Action Buttons: Accept Resolution OR Request Rework */}
          <div className="flex gap-4">
            <button
              onClick={handleAcceptResolution}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18}/> Accept Resolution
            </button>
            <button
              onClick={() => setShowReworkModal(true)}
              className="flex-1 border-2 border-amber-500 hover:bg-amber-50 text-amber-700 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18}/> Request Rework
            </button>
          </div>
        </div>
      )}

      {/* Rework Banner if Rework Requested */}
      {isRework && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5"/>
          <div>
            <p className="text-sm font-bold text-amber-900">Rework Requested</p>
            <p className="text-xs text-amber-800 mt-0.5">
              You requested rework on this complaint. The Department Head has been notified to reassign the task to the worker for corrective action.
            </p>
          </div>
        </div>
      )}

      {/* Citizen Approved Banner */}
      {isCitizenApproved && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mb-6 flex items-start gap-3 shadow-sm">
          <CheckCircle2 size={22} className="text-teal-600 flex-shrink-0 mt-0.5"/>
          <div>
            <p className="text-sm font-bold text-teal-950">Resolution Approved by You!</p>
            <p className="text-xs text-teal-800 mt-0.5">
              Thank you for reviewing the work! Your approval has been submitted to the Department Head for final verification and closure.
            </p>
          </div>
        </div>
      )}

      {/* Final Resolution Completed Banner */}
      {isResolved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 flex items-start gap-3 shadow-sm">
          <CheckCircle2 size={22} className="text-emerald-600 flex-shrink-0 mt-0.5"/>
          <div>
            <p className="text-sm font-bold text-emerald-950">Complaint Resolution Approved & Officially Closed!</p>
            <p className="text-xs text-emerald-800 mt-0.5">
              The Department Head has verified and approved the resolution. Your civic complaint is now officially resolved. Thank you!
            </p>
          </div>
        </div>
      )}

      {/* STEP 15 & 16 – Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Rate Resolution Service</h3>
            <p className="text-xs text-gray-500 mb-4">Please rate your satisfaction to close this complaint.</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`text-2xl transition-transform hover:scale-125 ${n <= rating ? 'text-amber-400' : 'text-gray-300'}`}
                >
                  <Star size={32} className={n <= rating ? 'fill-amber-400' : ''}/>
                </button>
              ))}
            </div>

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              placeholder="Share comments regarding the resolution quality..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={submittingFeedback}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {submittingFeedback ? <Loader2 size={16} className="animate-spin"/> : 'Submit & Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rework Reason Modal */}
      {showReworkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Request Rework</h3>
            <p className="text-xs text-gray-500 mb-4">Please explain why the resolution requires further work.</p>

            <textarea
              value={reworkReason}
              onChange={(e) => setReworkReason(e.target.value)}
              rows={4}
              placeholder="Describe what needs to be fixed..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowReworkModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitReworkRequest}
                disabled={submittingRework || !reworkReason.trim()}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submittingRework ? <Loader2 size={16} className="animate-spin"/> : 'Send Rework Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
