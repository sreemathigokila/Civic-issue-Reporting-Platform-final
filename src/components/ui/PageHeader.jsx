export default function PageHeader({ title, subtitle, badge, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {badge && (<span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">{badge}</span>)}
        </div>
        {subtitle && (<p className="text-gray-500 mt-1 max-w-2xl">{subtitle}</p>)}
      </div>
      {actions && (<div className="flex flex-wrap gap-3">{actions}</div>)}
    </div>
  );
}
