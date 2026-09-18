import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ items = [], open, onClose }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const currentUser = profile || user;
  const displayName = currentUser?.full_name || currentUser?.fullName || 'User';

  const initials = displayName !== 'User'
    ? displayName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleKey = (currentUser?.role || '').toLowerCase().replace('role_', '');

  const roleLabel = {
    citizen: 'Civic Contributor',
    worker: 'Field Worker',
    dept_head: 'Department Head',
    district_admin: 'District Admin',
    super_admin: 'Super Admin',
    admin: 'Administrator',
  }[roleKey] || 'User';

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <>
      {/* Backdrop overlay for both Desktop and Mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 animate-fadeIn" 
          onClick={onClose} 
        />
      )}

      {/* Hamburger Slide-out Drawer */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 w-72 bg-white shadow-2xl border-r border-gray-100 z-50
          flex flex-col transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-800 bg-gradient-to-r from-purple-700 to-purple-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center font-bold text-white shadow-inner">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{displayName}</p>
              <div className="flex items-center gap-1 text-xs text-purple-200">
                <ShieldCheck size={13} />
                <span className="truncate">{roleLabel}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Navigation Menu
          </p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-900'
                }`
              }
            >
              <item.icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={19} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
