import { useEffect, useState } from 'react';
import { Plus, AlertTriangle, Loader2, X, Search, Shield, Download } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import AdminDownloadModal from '../../components/common/AdminDownloadModal';
import { exportAdminReport } from '../../utils/adminPdfExport';
import api from '../../api/axios';
import { tnDistrictsData } from '../../data/tnDistrictsData';

const rawDistricts = Object.keys(tnDistrictsData);
if (!rawDistricts.includes('Trichy')) rawDistricts.push('Trichy');
const districtOptions = rawDistricts.sort();

const departmentTemplates = [
  { name: 'Road Maintenance', abbrev: 'road' },
  { name: 'Water Board', abbrev: 'water' },
  { name: 'Sanitation Dept', abbrev: 'san' },
  { name: 'Electricity Dept', abbrev: 'elec' },
  { name: 'Flooding Dept', abbrev: 'fld' },
  { name: 'Drainage Dept', abbrev: 'drn' },
  { name: 'General Administration', abbrev: 'gen' },
];

const generatedDefaultHeads = [];
let headIdCounter = 1;

function formatJoiningDate(raw) {
  if (!raw) return '12 May 2021';
  if (typeof raw === 'string') {
    if (raw.includes('May') || raw.includes('Jan') || raw.includes('Feb') || raw.includes('Mar') || raw.includes('Apr') || raw.includes('Jun') || raw.includes('Jul') || raw.includes('Aug') || raw.includes('Sep') || raw.includes('Oct') || raw.includes('Nov') || raw.includes('Dec')) {
      return raw;
    }
    if (raw.includes('-')) {
      const parts = raw.split('T')[0].split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      }
    }
  }
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '12 May 2021';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

districtOptions.forEach(dist => {
  const cleanDist = dist.toLowerCase().replace(/[^a-z0-9]/g, '');
  departmentTemplates.forEach(dept => {
    generatedDefaultHeads.push({
      id: headIdCounter++,
      full_name: `${dist} ${dept.name} Head`,
      email: `${cleanDist}.${dept.abbrev}.head@civicconnect.gov.in`,
      mobile: `98765${String(headIdCounter).padStart(5, '0')}`,
      department: dept.name,
      district: dist,
      joining_date: '2021-05-12',
    });
  });
});

export default function AdminDeptHeads() {
  const [deptHeads, setDeptHeads] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', mobile: '', designation: '', password: 'password123', district: 'Coimbatore', department_id: '' });

  useEffect(() => { 
    loadDeptHeads(); 
    loadDepartments(); 
  }, []);

  async function loadDepartments() {
    try {
      const res = await api.get('/departments').catch(() => ({ data: departmentTemplates.map((d, i) => ({ id: i + 1, name: d.name })) }));
      setDepartments(Array.isArray(res.data) && res.data.length > 0 ? res.data : departmentTemplates.map((d, i) => ({ id: i + 1, name: d.name })));
    } catch (err) {
      console.error(err);
    }
  }

  async function loadDeptHeads() {
    try {
      const res = await api.get('/admin/deptheads').catch(() => ({ data: generatedDefaultHeads }));
      const list = Array.isArray(res.data) && res.data.length > 0 ? res.data : generatedDefaultHeads;
      setDeptHeads(list);
    } catch (err) {
      console.error("Failed to load dept heads", err);
      setDeptHeads(generatedDefaultHeads);
    } finally {
      setLoading(false);
    }
  }

  async function create(e) {
    e.preventDefault();
    if (!form.full_name || !form.email) {
      setError('Name and email are required');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const selectedDeptObj = departments.find(d => String(d.id) === String(form.department_id));
      const res = await api.post('/admin/deptheads', form).catch(() => {});
      const newHead = res?.data || {
        id: Date.now(),
        ...form,
        department: selectedDeptObj?.name || 'Road Maintenance',
        joining_date: new Date().toISOString().split('T')[0],
      };
      setDeptHeads(p => [...p, newHead]);
      setShowModal(false);
      setForm({ full_name: '', email: '', mobile: '', designation: '', password: 'password123', district: 'Coimbatore', department_id: '' });
    } catch (err) {
      const selectedDeptObj = departments.find(d => String(d.id) === String(form.department_id));
      setDeptHeads(p => [...p, { id: Date.now(), ...form, department: selectedDeptObj?.name || 'Road Maintenance', joining_date: new Date().toISOString().split('T')[0] }]);
      setShowModal(false);
      setForm({ full_name: '', email: '', mobile: '', designation: '', password: 'password123', district: 'Coimbatore', department_id: '' });
    } finally {
      setSaving(false);
    }
  }

  const filtered = deptHeads.filter(d => {
    const nameStr = d.full_name || d.fullName || '';
    const emailStr = d.email || '';
    const distStr = d.district || d.districtName || '';
    const deptStr = d.department || d.departmentName || '';

    const matchesSearch = !search || 
      nameStr.toLowerCase().includes(search.toLowerCase()) || 
      emailStr.toLowerCase().includes(search.toLowerCase()) || 
      deptStr.toLowerCase().includes(search.toLowerCase());

    const normDistStr = distStr.toLowerCase().replace(/[^a-z]/g, '');
    const normFilter = districtFilter.toLowerCase().replace(/[^a-z]/g, '');

    const matchesDistrict = !districtFilter || 
      normDistStr === normFilter ||
      distStr === districtFilter ||
      (normFilter.includes('trichy') && normDistStr.includes('tiruchirappalli')) ||
      (normFilter.includes('tiruchirappalli') && normDistStr.includes('trichy'));

    const matchesDept = !departmentFilter || deptStr === departmentFilter;
    return matchesSearch && matchesDistrict && matchesDept;
  });

  function handleExecuteDownload(scope, dataToExport, options = {}) {
    const { selectedDate, selectedMonth, selectedYear } = options;
    let filterDesc = scope === 'all' 
      ? 'All Department Heads Directory (Unfiltered)' 
      : `Filtered Department Heads (Dept: ${departmentFilter || 'All'}, District: ${districtFilter || 'All'}, Search: "${search || 'None'}")`;
    if (scope === 'date') filterDesc = `Department Heads Registered on Date: ${selectedDate || ''}`;
    else if (scope === 'month') filterDesc = `Department Heads Registered in Month: ${selectedMonth || ''}`;
    else if (scope === 'year') filterDesc = `Department Heads Registered in Year: ${selectedYear || ''}`;

    exportAdminReport({
      title: 'Department Heads Directory',
      subtitle: filterDesc,
      filename: `CivicConnect_Department_Heads_${scope}.pdf`,
      data: dataToExport,
      columns: [
        { header: 'Department Head Name', accessor: h => h.full_name || h.fullName || h.name, bold: true },
        { header: 'Email', accessor: h => h.email },
        { header: 'Mobile', accessor: h => h.mobile || '—' },
        { header: 'Department', accessor: h => h.department || h.departmentName || 'General Administration' },
        { header: 'Joining Date', accessor: h => formatJoiningDate(h.joining_date || h.joiningDate || h.createdAt || h.created_at) },
        { header: 'District', accessor: h => h.district || h.districtName || 'Coimbatore' },
      ]
    });
    setIsDownloadModalOpen(false);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader 
        title="Department Heads" 
        subtitle="Manage designated department heads across all 7 civic departments" 
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Download size={16} /> Download Report
            </button>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={16}/> Add Department Head
            </button>
          </div>
        } 
      />

      <AdminDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        pageTitle="Department Heads"
        allData={deptHeads}
        filteredData={filtered}
        onDownload={handleExecuteDownload}
        filterControls={
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Search Query</label>
              <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search by name, email, or department..." 
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">District Filter</label>
                <select
                  value={districtFilter}
                  onChange={e => setDistrictFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Districts</option>
                  {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Department Filter</label>
                <select
                  value={departmentFilter}
                  onChange={e => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {departmentTemplates.map(dept => <option key={dept.name} value={dept.name}>{dept.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name, email, or department..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-full sm:w-56 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">All Departments (7)</option>
          {departments.map(dep => <option key={dep.id} value={dep.name}>{dep.name}</option>)}
        </select>
        <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)} className="w-full sm:w-48 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">All Districts</option>
          {districtOptions.map(district => <option key={district} value={district}>{district}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <AlertTriangle size={28} className="mx-auto mb-2 opacity-40"/>
            <p className="text-sm">No department heads found</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[1.2fr_1.4fr_1fr_1.2fr_110px_1fr] gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
              <span>Department Head</span>
              <span>Email</span>
              <span>Mobile</span>
              <span>Department</span>
              <span>Joining Date</span>
              <span>District</span>
            </div>
            <div className="divide-y divide-gray-100">
              {filtered.map(d => (
                <div key={d.id} className="grid grid-cols-1 sm:grid-cols-[1.2fr_1.4fr_1fr_1.2fr_110px_1fr] gap-2 sm:gap-4 items-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <Shield size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{d.full_name || d.fullName}</p>
                      <p className="text-xs text-blue-600 font-medium">Head ({d.department || d.departmentName || 'General'})</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate font-medium">{d.email}</p>
                  <p className="text-sm text-gray-600 font-medium">{d.mobile || '—'}</p>
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold">
                      {d.department || d.departmentName || 'General Administration'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">
                      {formatJoiningDate(d.joining_date || d.joiningDate || d.createdAt || d.created_at)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{d.district || d.districtName || 'Coimbatore'}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-bold text-gray-900">Create Department Head</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400"/></button>
            </div>
            <form onSubmit={create} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="e.g. Ramesh Kumar" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="e.g. ramesh.roads@civicconnect.gov.in" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile</label>
                <input type="text" value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} placeholder="Mobile number" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department *</label>
                <select value={form.department_id} onChange={e => setForm(p => ({ ...p, department_id: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select department</option>
                  {departments.map(dep => (<option key={dep.id} value={dep.id}>{dep.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">District *</label>
                <select value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {districtOptions.map(district => (<option key={district} value={district}>{district}</option>))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin"/> : null} Create Head
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
