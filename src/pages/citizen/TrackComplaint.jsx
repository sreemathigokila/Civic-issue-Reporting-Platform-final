import { useEffect, useState } from 'react';
import { Search, ArrowRight, AlertTriangle, Clock } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressTracker from '../../components/common/ProgressTracker';
import PageHeader from '../../components/ui/PageHeader';
import { formatComplaintId } from '../../utils/formatId';
import api from '../../api/axios';

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState('');
  const [result, setResult] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadMyComplaints() {
      try {
        const response = await api.get('/complaints/citizen');
        const list = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        setMyComplaints(list);
        if (list.length > 0) {
          setResult(list[0]);
          setComplaintId(formatComplaintId(list[0]));
        }
      } catch (err) {
        console.error("Failed to load user complaints for tracking", err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadMyComplaints();
  }, []);

  async function handleTrack(e) {
    if (e) e.preventDefault();
    if (!complaintId.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);

    try {
      const response = await api.get(`/complaints/code/${complaintId.trim()}`);
      if (response.data) {
        setResult(response.data);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error("Failed to track complaint", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  function selectComplaint(c) {
    setResult(c);
    setComplaintId(formatComplaintId(c));
    setNotFound(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Track Complaint" subtitle="Track real-time progress and timeline of your reported issues" />

      {/* Search Input */}
      <form onSubmit={handleTrack} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input 
            type="text" 
            value={complaintId} 
            onChange={e => setComplaintId(e.target.value)} 
            placeholder="Enter complaint ID (e.g. C-1001 or C-1002)" 
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {loading ? 'Searching...' : <><span>Track</span><ArrowRight size={16}/></>}
        </button>
      </form>

      {/* Quick Select List of Citizen Complaints */}
      {myComplaints.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Clock size={13} /> Select your complaint to track:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {myComplaints.map(c => {
              const code = formatComplaintId(c);
              const isSelected = result && (result.id === c.id || formatComplaintId(result) === code);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectComplaint(c)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {code} · {c.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {notFound && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center mb-6">
          <AlertTriangle size={32} className="mx-auto mb-2 text-orange-400"/>
          <p className="font-semibold text-gray-800">Complaint not found</p>
          <p className="text-sm text-gray-500 mt-1">Please check the complaint ID and try again</p>
        </div>
      )}

      {initialLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : result && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <p className="text-xs text-blue-200 mb-1 font-medium">Complaint Details</p>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{result.title}</h2>
                <StatusBadge status={result.status}/>
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Complaint ID</p>
                <p className="font-bold text-blue-600">{formatComplaintId(result)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Issue Category</p>
                <p className="font-semibold text-gray-900">{result.category || 'General'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Location</p>
                <p className="font-semibold text-gray-900 text-sm">{result.locationAddress || result.location_address || 'Coimbatore'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Submitted On</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {result.createdAt ? new Date(result.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Assigned Department</p>
                <p className="font-semibold text-gray-900 text-sm">{result.departmentName || result.assignedDepartment || 'Road Maintenance'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-5">Progress Timeline & Status</h3>
            <ProgressTracker status={result.status}/>
          </div>
        </div>
      )}
    </div>
  );
}
