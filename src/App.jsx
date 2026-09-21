import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/common/AppLayout';

// Public
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';

// Citizen
import CitizenDashboard from './pages/citizen/Dashboard';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import VoiceComplaint from './pages/citizen/VoiceComplaint';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetail from './pages/citizen/ComplaintDetail';
import CitizenNotifications from './pages/citizen/Notifications';
import CitizenProfile from './pages/citizen/Profile';
import CitizenSettings from './pages/citizen/Settings';
import TrackComplaint from './pages/citizen/TrackComplaint';

// Worker
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerTasks from './pages/worker/Tasks';
import WorkerTaskDetail from './pages/worker/TaskDetail';

// Dept Head
import DeptHeadDashboard from './pages/depthead/Dashboard';
import DeptHeadComplaints from './pages/depthead/Complaints';
import DeptHeadComplaintDetail from './pages/depthead/ComplaintDetail';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminDepartments from './pages/admin/Departments';
import AdminWorkers from './pages/admin/Workers';
import AdminCitizens from './pages/admin/Citizens';
import AdminComplaints from './pages/admin/Complaints';
import AdminComplaintDetail from './pages/admin/ComplaintDetail';
import AdminDeptHeads from './pages/admin/DeptHeads';

import { LayoutDashboard, Plus, Mic, FileText, Bell, User, Settings, Search, Wrench, ClipboardList, Building2, Users, Shield } from 'lucide-react';

const citizenNav = [
  { label: 'Dashboard', to: '/citizen/dashboard', icon: LayoutDashboard },
  { label: 'Submit Complaint', to: '/citizen/submit', icon: Plus },
  { label: 'Voice Complaint', to: '/citizen/voice', icon: Mic },
  { label: 'My Complaints', to: '/citizen/complaints', icon: FileText },
  { label: 'Track Complaint', to: '/citizen/track', icon: Search },
  { label: 'Notifications', to: '/citizen/notifications', icon: Bell },
  { label: 'My Profile', to: '/citizen/profile', icon: User },
  { label: 'Settings', to: '/citizen/settings', icon: Settings },
];

const workerNav = [
  { label: 'Dashboard', to: '/worker/dashboard', icon: LayoutDashboard },
  { label: 'My Tasks', to: '/worker/tasks', icon: ClipboardList },
  { label: 'Notifications', to: '/worker/notifications', icon: Bell },
  { label: 'My Profile', to: '/worker/profile', icon: User },
  { label: 'Settings', to: '/worker/settings', icon: Settings },
];

const deptHeadNav = [
  { label: 'Dashboard', to: '/depthead/dashboard', icon: LayoutDashboard },
  { label: 'Complaints', to: '/depthead/complaints', icon: FileText },
  { label: 'Notifications', to: '/depthead/notifications', icon: Bell },
  { label: 'My Profile', to: '/depthead/profile', icon: User },
  { label: 'Settings', to: '/depthead/settings', icon: Settings },
];

const adminNav = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Departments', to: '/admin/departments', icon: Building2 },
  { label: 'Dept Heads', to: '/admin/dept-heads', icon: Users },
  { label: 'Workers', to: '/admin/workers', icon: Wrench },
  { label: 'Citizens', to: '/admin/citizens', icon: Users },
  { label: 'Complaints', to: '/admin/complaints', icon: FileText },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
  { label: 'Admin Profile', to: '/admin/profile', icon: Shield },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Citizen */}
          <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
            <Route element={<AppLayout sidebarItems={citizenNav} />}>
              <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
              <Route path="/citizen/submit" element={<SubmitComplaint />} />
              <Route path="/citizen/voice" element={<VoiceComplaint />} />
              <Route path="/citizen/complaints" element={<MyComplaints />} />
              <Route path="/citizen/complaints/:id" element={<ComplaintDetail />} />
              <Route path="/citizen/track" element={<TrackComplaint />} />
              <Route path="/citizen/notifications" element={<CitizenNotifications />} />
              <Route path="/citizen/profile" element={<CitizenProfile />} />
              <Route path="/citizen/settings" element={<CitizenSettings />} />
            </Route>
          </Route>

          {/* Worker */}
          <Route element={<ProtectedRoute allowedRoles={['worker']} />}>
            <Route element={<AppLayout sidebarItems={workerNav} />}>
              <Route path="/worker/dashboard" element={<WorkerDashboard />} />
              <Route path="/worker/tasks" element={<WorkerTasks />} />
              <Route path="/worker/tasks/:id" element={<WorkerTaskDetail />} />
              <Route path="/worker/notifications" element={<CitizenNotifications />} />
              <Route path="/worker/profile" element={<CitizenProfile />} />
              <Route path="/worker/settings" element={<CitizenSettings />} />
            </Route>
          </Route>

          {/* Dept Head */}
          <Route element={<ProtectedRoute allowedRoles={['dept_head']} />}>
            <Route element={<AppLayout sidebarItems={deptHeadNav} />}>
              <Route path="/depthead/dashboard" element={<DeptHeadDashboard />} />
              <Route path="/depthead/complaints" element={<DeptHeadComplaints />} />
              <Route path="/depthead/complaints/:id" element={<DeptHeadComplaintDetail />} />
              <Route path="/depthead/notifications" element={<CitizenNotifications />} />
              <Route path="/depthead/profile" element={<CitizenProfile />} />
              <Route path="/depthead/settings" element={<CitizenSettings />} />
            </Route>
          </Route>

          {/* Admin (Super Admin & District Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin', 'district_admin']} />}>
            <Route element={<AppLayout sidebarItems={adminNav} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/departments" element={<AdminDepartments />} />
              <Route path="/admin/dept-heads" element={<AdminDeptHeads />} />
              <Route path="/admin/workers" element={<AdminWorkers />} />
              <Route path="/admin/citizens" element={<AdminCitizens />} />
              <Route path="/admin/complaints" element={<AdminComplaints />} />
              <Route path="/admin/complaints/:id" element={<AdminComplaintDetail />} />
              <Route path="/admin/notifications" element={<CitizenNotifications />} />
              <Route path="/admin/profile" element={<CitizenProfile />} />
              <Route path="/admin/settings" element={<CitizenSettings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
