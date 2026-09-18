const colorMap = {
  Pending: 'bg-amber-100 text-amber-700',
  Assigned: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  Completed: 'bg-green-100 text-green-700',
  Reopened: 'bg-red-100 text-red-700',
  Verified: 'bg-teal-100 text-teal-700',
};

export default function Badge({ children, status }) {
  const cls = colorMap[status] || 'bg-gray-100 text-gray-700';
  return (<span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{children || status}</span>);
}
