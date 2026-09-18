const config = {
  SUBMITTED: { label: 'Submitted', className: 'bg-slate-100 text-slate-800' },
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  ASSIGNED: { label: 'Assigned', className: 'bg-purple-100 text-purple-800' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-purple-150 text-purple-900 font-semibold' },
  SUBMITTED_FOR_REVIEW: { label: 'Pending Citizen Review', className: 'bg-purple-200 text-purple-950 font-semibold' },
  CITIZEN_APPROVED: { label: 'Citizen Approved', className: 'bg-teal-100 text-teal-800' },
  REWORK_REQUESTED: { label: 'Rework Requested', className: 'bg-orange-100 text-orange-800' },
  RESOLVED: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-800 font-bold' },
  CLOSED: { label: 'Closed', className: 'bg-gray-200 text-gray-800' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const key = String(status).toUpperCase().replace(/ /g, '_');
  const c = config[key] ?? config[status] ?? { 
    label: status.replace(/_/g, ' '), 
    className: 'bg-gray-100 text-gray-800' 
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.className}`}>
      {c.label}
    </span>
  );
}
