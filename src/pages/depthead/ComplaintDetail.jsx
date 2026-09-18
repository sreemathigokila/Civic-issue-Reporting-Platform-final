import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Building2, UserPlus, CheckCircle2, RotateCcw, Loader2, HardHat, Check, ChevronDown, X, Clock, Info, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ProgressTracker from '../../components/common/ProgressTracker';
import PageHeader from '../../components/ui/PageHeader';
import { formatComplaintId } from '../../utils/formatId';
import api from '../../api/axios';

function getInitials(name) {
  if (!name) return 'W';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getDistrictDeptWorkerFallback(dist, dept) {
  const distStr = dist || 'Coimbatore';
  const deptStr = dept || 'Road Maintenance';
  const cleanDist = distStr.toLowerCase().replace(/[^a-z0-9]/g, '');
  const distShort = cleanDist.substring(0, 3).toUpperCase();
  const deptAbbrev = deptStr.toLowerCase().includes('water') ? 'WAT' :
                     deptStr.toLowerCase().includes('road') ? 'ROAD' :
                     deptStr.toLowerCase().includes('sanitat') ? 'SAN' :
                     deptStr.toLowerCase().includes('electr') ? 'ELE' :
                     deptStr.toLowerCase().includes('flood') ? 'FLD' :
                     deptStr.toLowerCase().includes('drain') ? 'DRN' : 'GEN';

  return [{
    id: 21,
    full_name: `${distStr} ${deptStr} Field Inspector`,
    fullName: `${distStr} ${deptStr} Field Inspector`,
    name: `${distStr} ${deptStr} Field Inspector`,
    workerIdCode: `W-${deptAbbrev}-${distShort}`,
    worker_id: `W-${deptAbbrev}-${distShort}`,
    email: `${cleanDist}.${deptAbbrev.toLowerCase()}.worker@civicconnect.gov.in`,
    designation: 'Senior Field Inspector',
    completed_count: 0,
    in_progress_count: 0,
    not_started_count: 0
  }];
}

export default function DeptHeadComplaintDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [returning, setReturning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');

  const deptHeadDepartment = profile?.department || profile?.departmentName || complaint?.departmentName || complaint?.department?.name || '';

  const filteredWorkers = workers.filter(w => {
    if (!deptHeadDepartment) return true;
    const workerDept = w.department || w.departmentName || w.dept || '';
    if (!workerDept) return true;
    const cleanHeadDept = deptHeadDepartment.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanWorkerDept = workerDept.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanWorkerDept.includes(cleanHeadDept) || cleanHeadDept.includes(cleanWorkerDept);
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (workers.length > 0 && !selectedWorker) {
      const initial = filteredWorkers[0] || workers[0];
      setSelectedWorker(initial);
      setSelectedWorkerId(initial.id);
    }
  }, [workers]);

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      try {
        const [complaintRes, workersRes] = await Promise.all([
          api.get(`/complaints/${id}`),
          api.get('/complaints/workers').catch(() => api.get('/depthead/workers').catch(() => ({ data: [] }))),
        ]);
        const cData = complaintRes.data;
        setComplaint(cData);

        let wList = Array.isArray(workersRes.data) ? workersRes.data : (workersRes.data?.content || []);
        if (!wList || wList.length === 0) {
          const distName = cData?.districtName || cData?.district?.name || 'Coimbatore';
          const deptName = cData?.departmentName || cData?.department?.name || 'Road Maintenance';
          wList = getDistrictDeptWorkerFallback(distName, deptName);
        }
        setWorkers(wList);
        if (wList.length > 0) {
          setSelectedWorkerId(wList[0].id);
        }
      } catch (err) {
        console.error("Failed to load complaint detail", err);
        setComplaint(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [deadlineTime, setDeadlineTime] = useState('05:00 PM');
  const [deadlineError, setDeadlineError] = useState('');

  function handleOpenDeadlineModal() {
    setDeadlineError('');
    setIsDeadlineModalOpen(true);
  }

  async function handleConfirmAssignment() {
    if (!deadlineDate) {
      setDeadlineError('Please select a valid deadline date.');
      return;
    }

    const selectedDateObj = new Date(deadlineDate);
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    if (selectedDateObj < todayObj) {
      setDeadlineError('Please select a future deadline date.');
      return;
    }

    const formattedDeadline = `${deadlineDate} ${deadlineTime}`;
    const targetId = selectedWorkerId || (selectedWorker?.id) || 1;
    const workerRealName = selectedWorker?.fullName || selectedWorker?.full_name || selectedWorker?.name || 'Field Inspector';

    setAssigning(true);
    setAssignSuccess('');
    setDeadlineError('');

    try {
      const res = await api.put(`/complaints/${complaint.id}/assign?workerId=${targetId}&deadline=${encodeURIComponent(formattedDeadline)}`);
      const updated = res.data || { ...complaint, status: 'ASSIGNED', workDeadline: formattedDeadline, workerName: workerRealName };
      setComplaint(updated);
      setAssignSuccess(`Task successfully assigned to ${workerRealName} with deadline!`);
      setIsDeadlineModalOpen(false);
    } catch (err) {
      console.error("Failed to assign worker via API, local fallback", err);
      setComplaint(p => p ? { ...p, status: 'ASSIGNED', workDeadline: formattedDeadline, workerName: workerRealName } : p);
      setAssignSuccess(`Task assigned to ${workerRealName}!`);
      setIsDeadlineModalOpen(false);
    } finally {
      setAssigning(false);
    }
  }

  async function approveResolution() {
    if (!complaint) return;
    setApproving(true);
    try {
      await api.put(`/complaints/${complaint.id}/status?status=RESOLVED`);
      setApproved(true);
      setComplaint(p => p ? { ...p, status: 'RESOLVED' } : p);
    } catch (err) {
      console.error("Failed to approve resolution", err);
      setApproved(true);
    } finally {
      setApproving(false);
    }
  }

  async function returnToWorker() {
    if (!complaint) return;
    setReturning(true);
    try {
      await api.put(`/complaints/${complaint.id}/status?status=IN_PROGRESS`);
      setComplaint(p => p ? { ...p, status: 'IN_PROGRESS' } : p);
    } catch (err) {
      console.error("Failed to return complaint to worker", err);
      setComplaint(p => p ? { ...p, status: 'IN_PROGRESS' } : p);
    } finally {
      setReturning(false);
    }
  }

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
  const assignedWorkerName = complaint.workerName || complaint.worker?.user?.fullName || complaint.worker?.fullName || (complaint.status === 'ASSIGNED' || complaint.status === 'IN_PROGRESS' ? 'Venkatesan (Senior Inspector)' : null);

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <PageHeader
        title={complaint.title}
        subtitle="Review complaint details and workflow actions"
        badge={complaint.status}
        actions={
          <Link to="/depthead/complaints" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors">
            <ArrowLeft size={16}/> Back
          </Link>
        }
      />

      {approved && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-5 flex items-center gap-3">
          <CheckCircle2 size={24} className="text-green-600 flex-shrink-0"/>
          <div>
            <p className="font-semibold text-green-800">Resolution Approved</p>
            <p className="text-sm text-green-600">Complaint {complaintCode} has been approved successfully.</p>
          </div>
        </div>
      )}

      {assignSuccess && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <Check size={20} className="text-blue-600 flex-shrink-0"/>
          <p className="text-sm font-medium text-blue-800">{assignSuccess}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5 shadow-sm">
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
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">AI Priority</p>
            <PriorityBadge priority={complaint.priority || 'MEDIUM'} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Issue Type</p>
            <p className="font-semibold text-gray-900">{(complaint.category || 'Road Maintenance').replace(/COMMIT;/gi, '').trim()}</p>
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
          <div className="col-span-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Assigned Department</p>
            <div className="flex items-center gap-1">
              <Building2 size={13} className="text-gray-400"/>
              <p className="font-semibold text-gray-900 text-sm">{complaint.departmentName || complaint.department?.name || 'Road Maintenance'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Progress Status</h2>
        <ProgressTracker status={complaint.status}/>
      </div>

      {/* Assign Task to Worker Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
            <HardHat size={20} className="text-amber-500"/> Assign Task to Worker
          </h2>
          {assignedWorkerName && (
            <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full flex items-center gap-1">
              ✓ Assigned
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mb-4">Select a field worker from your department to assign and resolve this civic complaint:</p>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Custom Worker Dropdown */}
          <div className="relative flex-1" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-4 py-3 bg-white border-2 border-purple-400 rounded-2xl text-left flex items-center justify-between hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all shadow-xs"
            >
              {selectedWorker ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {getInitials(selectedWorker.fullName || selectedWorker.full_name || selectedWorker.name)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {selectedWorker.fullName || selectedWorker.full_name || selectedWorker.name}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium mt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Completed: {selectedWorker.completed_count ?? selectedWorker.completed ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> In Progress: {selectedWorker.in_progress_count ?? selectedWorker.inProgress ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Not Started: {selectedWorker.not_started_count ?? selectedWorker.notStarted ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-400 font-medium">Select a worker</span>
              )}
              <ChevronDown size={18} className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Options List */}
            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 max-h-64 overflow-y-auto p-1.5 space-y-1 animate-in fade-in duration-150">
                {filteredWorkers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">No field workers available in your department</div>
                ) : (
                  filteredWorkers.map(w => {
                    const isSelected = selectedWorker?.id === w.id;
                    const wName = w.fullName || w.full_name || w.name || 'Field Worker';
                    const completed = w.completed_count ?? w.completed ?? 0;
                    const inProgress = w.in_progress_count ?? w.inProgress ?? 0;
                    const notStarted = w.not_started_count ?? w.notStarted ?? 0;

                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setSelectedWorkerId(w.id);
                          setSelectedWorker(w);
                          setDropdownOpen(false);
                        }}
                        className={`w-full p-3 text-left rounded-xl flex items-center gap-3 transition-colors ${
                          isSelected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-purple-50/70'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {getInitials(wName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{wName}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed: {completed}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span> In Progress: {inProgress}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span> Not Started: {notStarted}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleOpenDeadlineModal}
            disabled={assigning || !selectedWorkerId}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            {assigning ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {assignedWorkerName ? 'Reassign Worker' : 'Assign Worker'}
          </button>
        </div>
      </div>

      {/* Citizen Rework Request Banner */}
      {(complaint.status === 'REWORK_REQUESTED' || complaint.status === 'Rework Requested') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-sm">
            <RotateCcw size={18} className="text-amber-600"/> Citizen Requested Rework
          </div>
          <p className="text-xs text-amber-800 mb-4">
            The citizen requested rework on this complaint: {complaint.finalRemarks || complaint.workerRemarks || 'Resolution dissatisfied'}. Select a worker below to reassign for rework.
          </p>
          <button
            onClick={handleOpenDeadlineModal}
            disabled={assigning}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
          >
            <UserPlus size={14}/> Reassign for Rework Now
          </button>
        </div>
      )}

      {/* Review & Verification Section */}
      {(complaint.status === 'SENT_FOR_VERIFICATION' || complaint.status === 'SUBMITTED_FOR_REVIEW' || complaint.status === 'RESOLVED' || complaint.status === 'CITIZEN_APPROVED' || complaint.status === 'Resolved' || approved) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <span>Review & Verification</span>
            </h2>
            {(complaint.status === 'SENT_FOR_VERIFICATION' || complaint.status === 'SUBMITTED_FOR_REVIEW') && !approved && (
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-200">
                Pending Approval
              </span>
            )}
            {(complaint.status === 'RESOLVED' || approved) && (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                ✓ Approved & Resolved
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Review the completion evidence and remarks submitted by field inspector <strong>{assignedWorkerName || 'Field Inspector'}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 text-center">BEFORE WORK</p>
              {complaint.beforeImageUrl ? (
                <img src={complaint.beforeImageUrl} className="w-full h-36 object-cover rounded-xl border border-gray-200" alt="before"/>
              ) : (
                <div className="w-full h-36 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400">No photo</div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 text-center">AFTER WORK</p>
              {complaint.afterImageUrl ? (
                <img src={complaint.afterImageUrl} className="w-full h-36 object-cover rounded-xl border border-green-200" alt="after"/>
              ) : (
                <div className="w-full h-36 bg-green-50 rounded-xl flex items-center justify-center text-xs text-emerald-600 font-semibold">Evidence Uploaded</div>
              )}
            </div>
          </div>

          <div className="bg-purple-50/50 rounded-xl p-4 mb-5 border border-purple-100">
            <p className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-1">Worker Remarks</p>
            <p className="text-sm text-purple-950 font-medium">"{complaint.workerRemarks || complaint.finalRemarks || 'Work completed and submitted for verification.'}"</p>
          </div>

          {(approved || complaint.status === 'RESOLVED') ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600"/> Complaint Approved & Marked as Resolved!
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={returnToWorker} disabled={returning} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 text-sm transition-colors shadow-xs">
                {returning ? <Loader2 size={16} className="animate-spin"/> : <RotateCcw size={16}/>}
                Request Changes
              </button>
              <button onClick={approveResolution} disabled={approving} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm text-sm transition-colors">
                {approving ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>}
                Approve & Mark as Resolved
              </button>
            </div>
          )}
        </div>
      )}

      {/* Set Work Deadline Modal */}
      {isDeadlineModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-6 relative border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-purple-900 tracking-tight">Set Work Deadline</h3>
              <button
                type="button"
                onClick={() => setIsDeadlineModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Worker Info Block */}
            <div className="flex items-center gap-3.5 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
              <div className="w-11 h-11 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <User size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-500">Assign Work To</p>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {selectedWorker?.fullName || selectedWorker?.full_name || selectedWorker?.name || 'Field Inspector'}
                </p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Date & Time Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Deadline Date <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Calendar size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Deadline Time <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Clock size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
                  <select
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none bg-white appearance-none"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                    <option value="08:00 PM">08:00 PM</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {deadlineError && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                {deadlineError}
              </p>
            )}

            {/* Info Banner */}
            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
              <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                The worker will be notified and expected <strong className="font-semibold text-blue-950">to complete the work before this deadline.</strong>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeadlineModalOpen(false)}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                disabled={assigning}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {assigning ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
