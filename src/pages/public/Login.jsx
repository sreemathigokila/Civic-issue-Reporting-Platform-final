import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserCheck, Shield, HardHat, User, MapPin, KeyRound, X, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { tnDistrictsData } from '../../data/tnDistrictsData';
import api from '../../api/axios';

const demoDistricts = Object.keys(tnDistrictsData);
if (!demoDistricts.includes('Trichy')) demoDistricts.push('Trichy');
demoDistricts.sort();

const demoDeptTemplates = [
  { name: 'Water Board', abbrev: 'water', icon: '💧' },
  { name: 'Road Maintenance', abbrev: 'road', icon: '🛣️' },
  { name: 'Sanitation Dept', abbrev: 'san', icon: '🗑️' },
  { name: 'Electricity Dept', abbrev: 'elec', icon: '💡' },
  { name: 'Flooding Dept', abbrev: 'fld', icon: '🌊' },
  { name: 'Drainage Dept', abbrev: 'drn', icon: '🕳️' },
  { name: 'General Admin', abbrev: 'gen', icon: '📋' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemoDistrict, setSelectedDemoDistrict] = useState('Coimbatore');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotTarget, setForgotTarget] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotShowNewPass, setForgotShowNewPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotDemoOtp, setForgotDemoOtp] = useState('');
  const [forgotVerified, setForgotVerified] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    const res = await signIn(email.trim(), password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const roleKey = (stored.role || '').toLowerCase().replace('role_', '');

    const paths = {
      citizen: '/citizen/dashboard',
      worker: '/worker/dashboard',
      dept_head: '/depthead/dashboard',
      district_admin: '/admin/dashboard',
      super_admin: '/admin/dashboard',
      admin: '/admin/dashboard',
    };

    navigate(paths[roleKey] || '/citizen/dashboard', { replace: true });
  }

  function fillDemo(demoEmail, demoPass) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  }

  // Handle Forgot Password OTP Send
  async function handleSendForgotOtp() {
    if (!forgotTarget.trim()) {
      setForgotError('Please enter your registered email address or mobile number');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotMsg('');
    try {
      const res = await api.post('/auth/send-reset-otp', { target: forgotTarget.trim() });
      setForgotOtpSent(true);
      setForgotMsg(res.data?.message || `OTP sent to ${forgotTarget}`);
      if (res.data?.demoOtp) {
        setForgotDemoOtp(res.data.demoOtp);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setForgotLoading(false);
    }
  }

  // Handle Password Reset
  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      setForgotError('Please enter the OTP');
      return;
    }
    if (!forgotNewPass || forgotNewPass.length < 6) {
      setForgotError('New password must be at least 6 characters');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      // First verify OTP
      const isEmail = forgotTarget.includes('@');
      const verifyEndpoint = isEmail ? '/auth/verify-email-otp' : '/auth/verify-mobile-otp';
      const verifyPayload = isEmail 
        ? { email: forgotTarget.trim(), otp: forgotOtp.trim() } 
        : { mobile: forgotTarget.trim().replace(/\D/g, ''), otp: forgotOtp.trim() };

      const verifyRes = await api.post(verifyEndpoint, verifyPayload);
      if (!verifyRes.data?.verified) {
        setForgotError('Invalid or expired OTP');
        setForgotLoading(false);
        return;
      }

      // Reset Password
      const resetRes = await api.post('/auth/reset-password', {
        target: forgotTarget.trim(),
        newPassword: forgotNewPass,
      });

      setForgotMsg(resetRes.data?.message || 'Password reset successfully!');
      setPassword(forgotNewPass);
      setEmail(forgotTarget.trim());
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotOtpSent(false);
        setForgotOtp('');
        setForgotNewPass('');
      }, 1500);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  }

  const cleanDist = selectedDemoDistrict.toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-black text-xl tracking-wider">CC</span>
          </div>
          <h1 className="text-2xl font-bold text-purple-950">CivicConnect Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-7">

          {/* Quick Demo Credentials Assistant */}
          <div className="mb-6 bg-purple-50/50 border border-purple-100 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-purple-900 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <UserCheck size={14} className="text-purple-600" /> Quick Demo Login:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
              <button
                type="button"
                onClick={() => fillDemo('pradeepa@gmail.com', 'password123')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-gray-200 hover:border-purple-500 hover:bg-purple-50 text-gray-700 font-medium text-left transition-colors"
              >
                <User size={13} className="text-purple-600 shrink-0"/>
                <span className="truncate">Citizen (Pradeepa)</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@civicconnect.gov.in', 'password123')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-gray-200 hover:border-purple-500 hover:bg-purple-50 text-gray-700 font-medium text-left transition-colors"
              >
                <Shield size={13} className="text-purple-900 shrink-0"/>
                <span className="truncate">Super Admin</span>
              </button>
            </div>

            {/* All Districts & All Dept Heads Quick Select */}
            <div className="mt-2 pt-2 border-t border-purple-100 space-y-2">
              <div>
                <label htmlFor="demo-district-select" className="block text-[11px] font-semibold text-purple-900 mb-1 flex items-center gap-1">
                  <MapPin size={12} className="text-purple-600" /> Select District (38 Districts):
                </label>
                <select
                  id="demo-district-select"
                  name="demoDistrict"
                  value={selectedDemoDistrict}
                  onChange={(e) => setSelectedDemoDistrict(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white border border-purple-200 text-purple-950 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                >
                  {demoDistricts.map(dist => (
                    <option key={dist} value={dist}>{dist} District</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="demo-dept-head-select" className="block text-[11px] font-semibold text-purple-900 mb-1">
                  Select {selectedDemoDistrict} Dept Head (7 Departments):
                </label>
                <select
                  id="demo-dept-head-select"
                  name="demoDeptHead"
                  onChange={(e) => {
                    if (e.target.value) fillDemo(e.target.value, 'password123');
                  }}
                  defaultValue=""
                  className="w-full text-xs p-2 rounded-lg bg-white border border-purple-200 text-purple-950 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer mb-2"
                >
                  <option value="" disabled>-- Select {selectedDemoDistrict} Dept Head --</option>
                  {demoDeptTemplates.map(dept => {
                    const email = `${cleanDist}.${dept.abbrev}.head@civicconnect.gov.in`;
                    return (
                      <option key={dept.abbrev} value={email}>
                        {dept.icon} {dept.name} ({selectedDemoDistrict})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label htmlFor="demo-worker-select" className="block text-[11px] font-semibold text-purple-900 mb-1">
                  Select {selectedDemoDistrict} Field Worker (7 Departments):
                </label>
                <select
                  id="demo-worker-select"
                  name="demoWorker"
                  onChange={(e) => {
                    if (e.target.value) fillDemo(e.target.value, 'password123');
                  }}
                  defaultValue=""
                  className="w-full text-xs p-2 rounded-lg bg-white border border-purple-200 text-purple-950 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="" disabled>-- Select {selectedDemoDistrict} Field Worker --</option>
                  {demoDeptTemplates.map(dept => {
                    const email = `${cleanDist}.${dept.abbrev}.worker@civicconnect.gov.in`;
                    return (
                      <option key={`worker-${dept.abbrev}`} value={email}>
                        👷 {dept.name} Worker ({selectedDemoDistrict})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs font-medium px-4 py-3 rounded-xl mb-4 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Email Address or Mobile Number
              </label>
              <input
                id="login-email"
                name="email"
                type="text"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email (e.g. pradeepa@gmail.com)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotTarget(email || '');
                    setForgotError('');
                    setForgotMsg('');
                  }}
                  className="text-xs text-purple-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <KeyRound size={12} /> Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-60 shadow-sm mt-2 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'LOGIN TO ACCOUNT'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-600 font-bold hover:underline">
              Register New Account
            </Link>
          </p>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-purple-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-purple-950">Reset Password</h3>
                <p className="text-xs text-gray-500">Verify your identity using OTP to reset password</p>
              </div>
            </div>

            {forgotError && (
              <div className="bg-red-50 text-red-700 text-xs px-4 py-2.5 rounded-xl mb-4 border border-red-200 flex items-center gap-2">
                <ShieldAlert size={15} className="text-red-500 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotMsg && (
              <div className="bg-emerald-50 text-emerald-800 text-xs px-4 py-2.5 rounded-xl mb-4 border border-emerald-200 flex items-center gap-2 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{forgotMsg}</span>
              </div>
            )}

            {!forgotOtpSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Registered Email or Mobile Number *
                  </label>
                  <input
                    type="text"
                    value={forgotTarget}
                    onChange={(e) => setForgotTarget(e.target.value)}
                    placeholder="Enter email address or 10-digit mobile"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendForgotOtp}
                  disabled={forgotLoading || !forgotTarget.trim()}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {forgotLoading ? <Loader2 size={16} className="animate-spin" /> : 'Send Verification OTP'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Enter Verification OTP *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-purple-200 rounded-xl text-center tracking-widest font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  {forgotDemoOtp && (
                    <div className="mt-2 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2 flex items-center justify-between">
                      <span>💡 Local Test OTP: <strong className="font-mono text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded">{forgotDemoOtp}</strong></span>
                      <button type="button" onClick={() => setForgotOtp(forgotDemoOtp)} className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded font-bold">Auto-Fill</button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={forgotShowNewPass ? 'text' : 'password'}
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setForgotShowNewPass(!forgotShowNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {forgotShowNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotOtpSent(false)}
                    className="w-1/3 py-3 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotOtp.trim() || forgotNewPass.length < 6}
                    className="w-2/3 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {forgotLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
