import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading user session...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  let role = (profile.role || '').toLowerCase().replace('role_', '');
  if (role === 'department_head') role = 'dept_head';

  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirectMap = {
      citizen: '/citizen/dashboard',
      worker: '/worker/dashboard',
      dept_head: '/depthead/dashboard',
      department_head: '/depthead/dashboard',
      district_admin: '/admin/dashboard',
      super_admin: '/admin/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={redirectMap[role] || '/login'} replace />;
  }

  return <Outlet />;
}
