import React from 'react';

const priorityConfig = {
  HIGH: { label: '🔴 High Priority', className: 'bg-red-50 text-red-700 border border-red-200 font-bold' },
  MEDIUM: { label: '🟡 Medium Priority', className: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold' },
  LOW: { label: '🟢 Low Priority', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium' },
};

export default function PriorityBadge({ priority }) {
  if (!priority) return null;
  const key = String(priority).toUpperCase().trim();
  const c = priorityConfig[key] || {
    label: `${key} Priority`,
    className: 'bg-slate-50 text-slate-700 border border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs tracking-tight ${c.className}`}>
      {c.label}
    </span>
  );
}
