export default function StatCard({ icon: Icon, value, label, title, change, desc }) {
  const displayLabel = title || label;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <Icon size={22} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {displayLabel && (
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
            {displayLabel}
          </div>
        )}
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {desc && <div className="text-xs text-gray-400 mt-0.5">{desc}</div>}
      </div>
      {change && (
        <div className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? `+${change}%` : `${change}%`}
        </div>
      )}
    </div>
  );
}
