import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, CheckCircle2, ShieldAlert, Mail, Phone, Lock, Sparkles, Loader2, RefreshCw, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { locationOptions } from '../../data/tnDistrictsData';
import api from '../../api/axios';

export default function Register() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Email OTP States
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailOtpMsg, setEmailOtpMsg] = useState('');
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailDemoOtp, setEmailDemoOtp] = useState('');

  // Mobile OTP States
  const [mobileVerified, setMobileVerified] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [mobileOtpLoading, setMobileOtpLoading] = useState(false);
  const [mobileOtpMsg, setMobileOtpMsg] = useState('');
  const [mobileOtpError, setMobileOtpError] = useState('');
  const [mobileCooldown, setMobileCooldown] = useState(0);
  const [mobileDemoOtp, setMobileDemoOtp] = useState('');

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    mobile: '',
    email: '',
    password: '',
    confirm_password: '',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    place: 'Gandhipuram',
    pincode: '641012',
    // Complete Address Details
    door_no: '',
    street: '',
    landmark: '',
    city: 'Coimbatore',
    address_district: 'Coimbatore',
    address_state: 'Tamil Nadu',
    address_pincode: '641012',
    agreed: true,
  });

  const districtOptions = form.state ? Object.keys(locationOptions['TamilNadu']?.districts || {}) : ['Coimbatore', 'Chennai', 'Madurai', 'Salem', 'Tiruchirappalli'];
  const placeOptions = locationOptions['TamilNadu']?.districts?.[form.district] || ['Gandhipuram', 'RS Puram', 'Peelamedu', 'Singanallur'];

  function setField(key, value) {
    if (key === 'email' && emailVerified) {
      setEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtpInput('');
    }
    if (key === 'mobile' && mobileVerified) {
      setMobileVerified(false);
      setMobileOtpSent(false);
      setMobileOtpInput('');
    }
    setForm((p) => ({ ...p, [key]: value }));
  }

  function handleDistrictChange(newDistrict) {
    const availablePlaces = locationOptions['TamilNadu']?.districts?.[newDistrict] || [];
    setForm((p) => ({
      ...p,
      district: newDistrict,
      address_district: newDistrict,
      place: availablePlaces.length > 0 ? availablePlaces[0] : '',
    }));
  }

  // Email Cooldown Timer
  useEffect(() => {
    if (emailCooldown <= 0) return;
    const timer = setInterval(() => setEmailCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [emailCooldown]);

  // Mobile Cooldown Timer
  useEffect(() => {
    if (mobileCooldown <= 0) return;
    const timer = setInterval(() => setMobileCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [mobileCooldown]);

  // SEND EMAIL OTP
  async function handleSendEmailOtp() {
    if (!form.email.trim() || !form.email.includes('@')) {
      setEmailOtpError('Please enter a valid email address');
      return;
    }
    setEmailOtpLoading(true);
    setEmailOtpError('');
    setEmailOtpInput('');
    setEmailOtpSent(true);
    try {
      const res = await api.post('/auth/send-email-otp', { email: form.email });
      setEmailOtpMsg(res.data?.message || `OTP has been sent to ${form.email}`);
      if (res.data?.demoOtp) {
        setEmailDemoOtp(res.data.demoOtp);
      }
      setEmailCooldown(30);
    } catch (err) {
      setEmailOtpError(err.response?.data?.message || 'Failed to send OTP to email');
    } finally {
      setEmailOtpLoading(false);
    }
  }

  // VERIFY EMAIL OTP
  async function handleVerifyEmailOtp() {
    if (!emailOtpInput.trim()) {
      setEmailOtpError('Please enter OTP');
      return;
    }
    setEmailOtpLoading(true);
    setEmailOtpError('');
    try {
      const res = await api.post('/auth/verify-email-otp', { email: form.email, otp: emailOtpInput });
      if (res.data?.verified) {
        setEmailVerified(true);
        setEmailOtpMsg('Email verified successfully');
      } else {
        setEmailOtpError('Invalid OTP');
      }
    } catch (err) {
      setEmailOtpError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setEmailOtpLoading(false);
    }
  }

  // SEND MOBILE OTP
  async function handleSendMobileOtp() {
    const cleanMobile = form.mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setMobileOtpError('Please enter a valid 10-digit mobile number');
      return;
    }
    setMobileOtpLoading(true);
    setMobileOtpError('');
    setMobileOtpInput('');
    try {
      const res = await api.post('/auth/send-mobile-otp', { mobile: cleanMobile });
      setMobileOtpSent(true);
      setMobileOtpMsg(res.data?.message || `OTP has been sent to +91 ${cleanMobile}`);
      if (res.data?.demoOtp) {
        setMobileDemoOtp(res.data.demoOtp);
      }
      setMobileCooldown(30);
    } catch (err) {
      setMobileOtpError(err.response?.data?.message || 'Failed to send OTP to mobile');
    } finally {
      setMobileOtpLoading(false);
    }
  }

  // VERIFY MOBILE OTP
  async function handleVerifyMobileOtp() {
    if (!mobileOtpInput.trim()) {
      setMobileOtpError('Please enter OTP');
      return;
    }
    setMobileOtpLoading(true);
    setMobileOtpError('');
    const cleanMobile = form.mobile.replace(/\D/g, '');
    try {
      const res = await api.post('/auth/verify-mobile-otp', { mobile: cleanMobile, otp: mobileOtpInput });
      if (res.data?.verified) {
        setMobileVerified(true);
        setMobileOtpMsg('Mobile verified successfully');
      } else {
        setMobileOtpError('Invalid OTP');
      }
    } catch (err) {
      setMobileOtpError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setMobileOtpLoading(false);
    }
  }

  // FINAL REGISTRATION SUBMIT
  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setError('');

    if (!emailVerified) {
      setError('Email Address must be verified with OTP before registering.');
      return;
    }

    if (!form.full_name.trim()) return setError('Full name is required');
    if (!form.mobile || form.mobile.trim().length < 10) return setError('Please enter a valid 10-digit mobile number');
    if (!form.password) return setError('Password is required');
    if (form.password !== form.confirm_password) return setError('Passwords do not match');
    if (!form.agreed) return setError('Please agree to Terms & Conditions');

    setLoading(true);
    const constructedAddress = [
      form.door_no,
      form.street,
      form.landmark ? `Near ${form.landmark}` : '',
      form.place,
      form.city,
      form.district,
      `${form.state} - ${form.pincode || form.address_pincode}`
    ].filter(Boolean).join(', ');

    const payload = {
      email: form.email,
      password: form.password,
      fullName: form.full_name,
      mobile: form.mobile,
      role: 'ROLE_CITIZEN',
      state: form.state,
      district: form.district,
      city: form.city || form.place,
      pincode: form.pincode || form.address_pincode,
      location: constructedAddress,
    };

    const res = await signUp(payload);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    navigate('/login');
  }

  const isFormValid =
    emailVerified &&
    form.full_name.trim() &&
    form.mobile &&
    form.mobile.trim().length >= 10 &&
    form.password &&
    form.password === form.confirm_password &&
    form.agreed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/20">
            <User size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-purple-950 tracking-tight">Create Citizen Account</h1>
          <p className="text-gray-500 font-medium mt-1">Step 2: Register to report and track civic issues</p>
        </div>

        {/* MAIN REGISTRATION FORM CARD (CENTERED) */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-purple-900/5 border border-purple-100 p-6 sm:p-8">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-2xl mb-6 border border-red-200 flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              
              {/* FULL NAME */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">FULL NAME *</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setField('full_name', e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                />
              </div>

              {/* MOBILE NUMBER FIELD WITH +91 */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">MOBILE NUMBER *</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3.5 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-700 text-sm">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) => setField('mobile', e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter mobile number"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                  />
                </div>
              </div>

              {/* EMAIL ADDRESS FIELD WITH VERIFY BUTTON */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">EMAIL ADDRESS *</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={form.email}
                    disabled={emailVerified}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-50 disabled:text-gray-500 font-medium"
                  />
                  {!emailVerified ? (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={emailOtpLoading || !form.email || !form.email.includes('@')}
                      className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {emailOtpLoading ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                    </button>
                  ) : null}
                </div>

                {/* EMAIL VERIFICATION STATUS BADGE */}
                <div className="mt-2 flex items-center justify-between">
                  {emailVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                      <CheckCircle2 size={14} className="text-emerald-600" /> Email verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 text-xs font-semibold rounded-full border border-gray-200">
                      <Mail size={13} className="text-gray-400" /> Email not verified
                    </span>
                  )}
                  {emailVerified && (
                    <button
                      type="button"
                      onClick={() => setEmailVerified(false)}
                      className="text-[11px] text-purple-600 font-bold hover:underline"
                    >
                      Change Email
                    </button>
                  )}
                </div>

                {/* EMAIL OTP INPUT PANEL (INLINE) */}
                {emailOtpSent && !emailVerified && (
                  <div className="mt-3 p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs">
                      <p className="font-semibold text-purple-950">
                        OTP has been sent to <strong className="text-purple-700">{form.email}</strong>
                      </p>
                      {emailCooldown > 0 ? (
                        <span className="text-gray-400 font-mono">Resend in {emailCooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          className="text-purple-700 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <RefreshCw size={11} /> Resend OTP
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        maxLength={6}
                        value={emailOtpInput}
                        onChange={(e) => setEmailOtpInput(e.target.value)}
                        placeholder="Enter 6-digit OTP sent to email"
                        className="flex-1 px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-center tracking-widest font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        disabled={emailOtpLoading || !emailOtpInput.trim()}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1"
                      >
                        {emailOtpLoading ? <Loader2 size={14} className="animate-spin" /> : 'Verify OTP'}
                      </button>
                    </div>

                    {emailOtpError && (
                      <p className="text-xs text-red-600 font-semibold">{emailOtpError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* DISTRICT *, TALUK *, PINCODE * */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">DISTRICT *</label>
                  <select
                    value={form.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-2.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    {districtOptions.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">TALUK *</label>
                  <select
                    value={form.place}
                    onChange={(e) => setField('place', e.target.value)}
                    className="w-full px-2.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    {placeOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">PINCODE *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, ''))}
                    placeholder="641012"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* PASSWORDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">PASSWORD *</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setField('password', e.target.value)}
                      placeholder="Create password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">CONFIRM PASSWORD *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirm_password}
                      onChange={(e) => setField('confirm_password', e.target.value)}
                      placeholder="Confirm password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* COMPLETE ADDRESS DETAILS CONTAINER */}
              <div className="p-5 bg-purple-50/40 border border-purple-200 rounded-2xl space-y-4">
                <h3 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">COMPLETE ADDRESS DETAILS *</h3>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">FLAT / HOUSE / DOOR NO. *</label>
                  <input
                    type="text"
                    value={form.door_no}
                    onChange={(e) => setField('door_no', e.target.value)}
                    placeholder="e.g., 12A"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">STREET / AREA / LOCALITY *</label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => setField('street', e.target.value)}
                    placeholder="e.g., 2nd Cross Street, Near Temple"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">LANDMARK (OPTIONAL)</label>
                  <input
                    type="text"
                    value={form.landmark}
                    onChange={(e) => setField('landmark', e.target.value)}
                    placeholder="e.g., Opposite to ABC School"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">CITY / TOWN *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setField('city', e.target.value)}
                    placeholder="e.g., Coimbatore"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">DISTRICT *</label>
                    <select
                      value={form.address_district}
                      onChange={(e) => setField('address_district', e.target.value)}
                      className="w-full px-2.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {districtOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">STATE *</label>
                    <select
                      value={form.address_state}
                      onChange={(e) => setField('address_state', e.target.value)}
                      className="w-full px-2.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">PINCODE *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={form.address_pincode}
                    onChange={(e) => setField('address_pincode', e.target.value.replace(/\D/g, ''))}
                    placeholder="641012"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* VERIFICATION REQUIRED WARNING BOX */}
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">EMAIL VERIFICATION REQUIRED</h4>
                  <p className="text-xs text-purple-800 mt-0.5 leading-relaxed font-medium">
                    Please verify your email address using OTP. Only verified email addresses are allowed for registration.
                  </p>
                </div>
              </div>

              {/* TERMS & CONDITIONS CHECKBOX */}
              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={(e) => setField('agreed', e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-purple-600 focus:ring-purple-500 rounded"
                />
                <span className="text-xs text-gray-600 font-medium">
                  I agree to the <span className="text-purple-700 font-bold">Terms & Conditions</span>
                </span>
              </label>

              {/* MAIN REGISTER BUTTON (DISABLED UNTIL EMAIL VERIFIED) */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                  isFormValid
                    ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 shadow-purple-600/20 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                }`}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : !isFormValid ? (
                  <>
                    <Lock size={16} /> REGISTER ACCOUNT (EMAIL VERIFICATION REQUIRED)
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> REGISTER ACCOUNT NOW
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-700 font-bold hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </div>
      </div>
    </div>
  );
}
