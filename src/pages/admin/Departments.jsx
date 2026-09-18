import { useEffect, useState } from 'react';
import { Plus, Trash2, AlertTriangle, Loader2, X, Download, Building2, Filter } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { exportAdminReport } from '../../utils/adminPdfExport';
import api from '../../api/axios';

const defaultDepts = [
  { id: 1, name: 'Road Maintenance', code: 'ROAD', description: 'Roads & Potholes Repair' },
  { id: 2, name: 'Sanitation Dept', code: 'SAN', description: 'Sanitation & Waste Management' },
  { id: 3, name: 'Water Board', code: 'WAT', description: 'Water & Utilities Supply' },
  { id: 4, name: 'Electricity Dept', code: 'ELE', description: 'Electrical & Streetlights' },
  { id: 5, name: 'Flooding Dept', code: 'FLD', description: 'Flooding & Monsoon Control' },
  { id: 6, name: 'Drainage Dept', code: 'DRN', description: 'Drainage & Sewerage Systems' },
  { id: 7, name: 'General Administration', code: 'GEN', description: 'General Civic Complaints' }
];

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  
  // Department Download Scope: 'all' | 'single'
  const [deptExportScope, setDeptExportScope] = useState('all');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDepts(); }, []);

  useEffect(() => {
    if (departments.length > 0 && !selectedDeptId) {
      setSelectedDeptId(String(departments[0].id));
    }
  }, [departments, selectedDeptId]);

  async function loadDepts() {
    try {
      const res = await api.get('/departments').catch(() => ({ data: defaultDepts }));
      const list = Array.isArray(res.data) && res.data.length > 0 ? res.data : defaultDepts;
      setDepartments(list);
      if (list.length > 0) setSelectedDeptId(String(list[0].id));
    } catch (err) {
      console.error("Failed to load departments", err);
      setDepartments(defaultDepts);
      setSelectedDeptId(String(defaultDepts[0].id));
    } finally {
      setLoading(false);
    }
  }

  async function saveDept(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/departments', form);
      setDepartments(p => [...p, res.data || { id: Date.now(), ...form }]);
    } catch (err) {
      setDepartments(p => [...p, { id: Date.now(), ...form }]);
    } finally {
      setSaving(false);
      setShowModal(false);
      setForm({ name: '', code: '', description: '' });
    }
  }

  async function deleteDept(id) {
    if (!confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
    } catch (err) {
      console.error("Delete failed", err);
    }
    setDepartments(p => p.filter(d => d.id !== id));
  }

  function handleConfirmDeptDownload() {
    let dataToExport = departments;
    let subtitleText = 'All Civic Departments Overview (Complete Dataset)';

    if (deptExportScope === 'single') {
      const found = departments.find(d => String(d.id) === String(selectedDeptId));
      if (found) {
        dataToExport = [found];
        subtitleText = `Department Details: ${found.name} (${found.code || '—'})`;
      }
    }

    exportAdminReport({
      title: 'Civic Departments List',
      subtitle: subtitleText,
      filename: `CivicConnect_Departments_${deptExportScope}.pdf`,
      data: dataToExport,
      columns: [
        { header: 'Department Code', accessor: d => d.code || '—', bold: true },
        { header: 'Department Name', accessor: d => d.name },
        { header: 'Description', accessor: d => d.description || 'Civic Infrastructure & Maintenance' },
      ]
    });

    setIsDownloadModalOpen(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Departments" 
        subtitle="Manage all 7 civic departments and their codes" 
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Download size={16} /> Download Report
            </button>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus size={16}/> Add Department
            </button>
          </div>
        } 
      />

      {/* Download Departments Report Modal with All Departments & By Department Options */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-6 relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
                  <Download size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Download Departments Report</h3>
                  <p className="text-xs text-gray-500">Select export scope and generate PDF</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: All Departments */}
              <button
                type="button"
                onClick={() => setDeptExportScope('all')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  deptExportScope === 'all'
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-100 shadow-sm'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div>
                  <p className={`font-bold text-sm flex items-center gap-2 ${deptExportScope === 'all' ? 'text-purple-900' : 'text-gray-900'}`}>
                    <Building2 size={16} className={deptExportScope === 'all' ? 'text-purple-600' : 'text-gray-400'} /> All Departments
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Export complete dataset with all department records
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  deptExportScope === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {departments.length} Records
                </span>
              </button>

              {/* Option 2: By Department */}
              <button
                type="button"
                onClick={() => setDeptExportScope('single')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  deptExportScope === 'single'
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-100 shadow-sm'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div>
                  <p className={`font-bold text-sm flex items-center gap-2 ${deptExportScope === 'single' ? 'text-purple-900' : 'text-gray-900'}`}>
                    <Filter size={16} className={deptExportScope === 'single' ? 'text-purple-600' : 'text-gray-400'} /> By Department
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Select a specific department to export
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  deptExportScope === 'single' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  1 Record
                </span>
              </button>
            </div>

            {/* Department Selector dropdown when 'single' is chosen */}
            {deptExportScope === 'single' && (
              <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-4 space-y-2 animate-in fade-in duration-150">
                <label className="text-xs font-bold text-purple-950 block">Select Specific Department:</label>
                <select
                  value={selectedDeptId}
                  onChange={e => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-gray-800 cursor-pointer"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code || '—'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                Will export <strong>{deptExportScope === 'all' ? departments.length : 1}</strong> record{deptExportScope === 'all' ? 's' : ''} as PDF.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeptDownload}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : departments.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <AlertTriangle size={28} className="mx-auto mb-2 opacity-40"/>
            <p className="text-sm">No departments yet</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-50">
              <span>Code</span>
              <span>Name</span>
              <span>Description</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-gray-50">
              {departments.map(d => (
                <div key={d.id} className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] gap-2 sm:gap-4 items-center px-6 py-4">
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold">{d.code || '—'}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{d.name}</p>
                    {d.description && <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>}
                  </div>
                  <p className="text-xs text-gray-400 hidden sm:block truncate max-w-xs">{d.description || 'Active'}</p>
                  <button onClick={() => deleteDept(d.id)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Add Department</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400"/></button>
            </div>
            <form onSubmit={saveDept} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department Name *</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                  placeholder="Enter department name" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department Code</label>
                <input 
                  type="text" 
                  value={form.code} 
                  onChange={e => setForm(p => ({ ...p, code: e.target.value }))} 
                  placeholder="e.g. RD, SD" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} 
                  rows={3} 
                  placeholder="Brief description" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin"/> : null} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
