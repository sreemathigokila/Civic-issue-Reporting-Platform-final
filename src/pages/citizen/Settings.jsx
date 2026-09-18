import { useEffect, useState } from 'react';
import { Bell, Shield, Eye, ChevronRight, LogOut, KeyRound, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function Settings() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ push: true, email: true, sms: false });
  const [savingKey, setSavingKey] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passStatus, setPassStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await api.get('/users/preferences');
        if (res.data) {
          setNotifications({
            push: res.data.push !== undefined ? res.data.push : true,
            email: res.data.email !== undefined ? res.data.email : true,
            sms: res.data.sms !== undefined ? res.data.sms : false,
          });
        }
      } catch (err) {
        console.error("Failed to load user preferences", err);
      }
    }
    loadPreferences();
  }, []);

  async function togglePreference(key) {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    setSavingKey(key);
    try {
      await api.put('/users/preferences', updated);
    } catch (err) {
      console.error("Failed to save preference", err);
      setNotifications(notifications); // revert on error
    } finally {
      setSavingKey(null);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPassStatus({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassStatus({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassStatus({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPassStatus({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    setPassLoading(true);
    try {
      await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      setPassStatus({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPassStatus({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setPassStatus({ 
        type: 'error', 
        text: err.response?.data?.message || err.response?.data?.error || 'Current password incorrect or failed to change password' 
      });
    }
    setPassLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Settings" subtitle="Manage your account settings, preferences and privacy" />

      {/* Account Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-5 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Shield size={18} className="text-blue-600"/> Account Security
          </h2>
        </div>
        <button 
          onClick={() => setShowPasswordModal(true)} 
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
        >
          <div className="text-left flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Change Password</p>
              <p className="text-xs text-gray-500">Update your security login password</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400"/>
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <KeyRound size={18} className="text-blue-600" /> Change Password
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {passStatus.text && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${passStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {passStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {passStatus.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  placeholder="Enter current password"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="Enter new password (min. 6 chars)"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)} 
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={passLoading} 
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {passLoading ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-5 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Bell size={18} className="text-blue-600"/> Notifications
          </h2>
        </div>
        {[
          { key: 'push', label: 'Push Notifications', desc: 'Get notified about complaint updates' },
          { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
          { key: 'sms', label: 'SMS Notifications', desc: 'Get SMS alerts for important updates' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <button 
              onClick={() => setNotifications(p => ({ ...p, [item.key]: !p[item.key] }))} 
              className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? 'left-6' : 'left-1'}`}/>
            </button>
          </div>
        ))}
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-5 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Eye size={18} className="text-blue-600"/> Privacy
          </h2>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            For your security, we will never share your personal details with anyone. Your data is encrypted and stored securely.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
        <div className="px-5 py-4">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 text-red-600 hover:text-red-700">
            <LogOut size={18}/>
            <div className="text-left">
              <p className="text-sm font-semibold">Logout</p>
              <p className="text-xs text-red-400">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
