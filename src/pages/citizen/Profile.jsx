import { useState, useEffect } from 'react';
import { Calendar, MapPin, Phone, Mail, Edit2, Save, X, Briefcase, BadgeCheck, CreditCard, Clock, UserCheck } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useDispatch } from 'react-redux';
import { setUserProfile } from '../../store/slices/authSlice';
import api from '../../api/axios';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    full_name: '',
    mobile: '',
    email: '',
    district: '',
    taluk: '',
    city: '',
    address: '',
    pincode: '',
    state: '',
    door_no: '',
    street: '',
    landmark: '',
  });

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    if (!profile) return;
    const addrParts = (profile.address || profile.location || '').split(',').map(s => s.trim());
    setForm({
      full_name: profile.fullName || profile.full_name || '',
      mobile: profile.mobile || '',
      email: profile.email || '',
      district: profile.district || '',
      taluk: profile.taluk || profile.place || 'Gandhipuram',
      city: profile.city || '',
      address: profile.address || profile.location || '',
      pincode: profile.pincode || '',
      state: profile.state || '',
      door_no: profile.door_no || addrParts[0] || '',
      street: profile.street || addrParts[1] || '',
      landmark: profile.landmark || addrParts[2] || '',
    });
  }, [profile]);

  function reset() {
    if (!profile) return;
    const addrParts = (profile.address || profile.location || '').split(',').map(s => s.trim());
    setForm({
      full_name: profile?.fullName || profile?.full_name || '',
      mobile: profile?.mobile || '',
      email: profile?.email || '',
      district: profile?.district || '',
      taluk: profile?.taluk || profile?.place || 'Gandhipuram',
      city: profile?.city || '',
      address: profile?.address || profile?.location || '',
      pincode: profile?.pincode || '',
      state: profile?.state || '',
      door_no: profile?.door_no || addrParts[0] || '',
      street: profile?.street || addrParts[1] || '',
      landmark: profile?.landmark || addrParts[2] || '',
    });
    setEditing(false);
    setMessage({ type: '', text: '' });
  }

  async function save() {
    if (!profile) return;
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const fullAddr = [form.door_no, form.street, form.landmark, form.city, form.district, form.state, form.pincode].filter(Boolean).join(', ');

      const res = await api.put('/users/profile', {
        fullName: form.full_name,
        mobile: form.mobile,
        district: form.district,
        address: fullAddr || form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      });

      dispatch(setUserProfile(res.data));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setSaving(false);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
      setSaving(false);
    }
  }

  const photoUrl = profile?.avatar_url || profile?.photo_url || profile?.image_url || null;
  const displayName = profile?.fullName || profile?.full_name || 'User';
  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const userDistrict = profile?.district || form.district || 'Coimbatore';
  const userCity = profile?.city || form.city || '';
  const displayLocation = userDistrict ? (userCity ? `${userCity}, ${userDistrict}` : userDistrict) : userCity;

  const roleKey = (profile?.role || '').toLowerCase().replace('role_', '');
  const isDeptHead = roleKey === 'dept_head' || roleKey === 'department_head' || profile?.role === 'ROLE_DEPARTMENT_HEAD' || (profile?.email && profile.email.includes('.head@'));
  const isWorker = roleKey === 'worker' || !!profile?.workerIdCode || !!profile?.designation;
  const isWorkUser = isDeptHead || isWorker;

  const deptDefault = profile?.department || profile?.departmentName 
    ? (profile.department || profile.departmentName)
    : profile?.email?.includes('water') ? 'Water Board'
    : profile?.email?.includes('road') ? 'Road Maintenance'
    : profile?.email?.includes('san') ? 'Sanitation Dept'
    : profile?.email?.includes('elec') ? 'Electricity Dept'
    : profile?.email?.includes('fld') ? 'Flooding Dept'
    : profile?.email?.includes('drn') ? 'Drainage Dept'
    : 'Road Maintenance';

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader 
        title="My Profile" 
        subtitle="View and manage your personal information" 
        actions={
          !editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm font-medium text-purple-600 border border-purple-200 px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer">
              <Edit2 size={15}/> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={reset} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                <X size={15}/> Cancel
              </button>
              <button onClick={save} disabled={saving} className="flex items-center gap-1.5 text-sm font-medium text-white bg-purple-600 px-3 py-2 rounded-xl hover:bg-purple-700 disabled:opacity-60 cursor-pointer">
                <Save size={15}/> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )
        } 
      />

      {message.text && (
        <div className={`p-4 mb-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 mb-5 shadow-xs">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-purple-600 text-white text-2xl font-bold flex-shrink-0 shadow-md">
            {photoUrl ? (<img src={photoUrl} alt="Profile" className="w-full h-full object-cover"/>) : initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-950">{displayName}</h2>
            <p className="text-sm text-purple-600 font-semibold uppercase">{profile?.role || (isDeptHead ? 'ROLE_DEPARTMENT_HEAD' : isWorker ? 'Field Worker' : 'Citizen')}</p>
            {displayLocation && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={13}/> {displayLocation}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Calendar size={12}/> Active Citizen Account
            </p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 mb-5 shadow-xs">
        <h3 className="font-bold text-purple-950 mb-5 uppercase text-xs tracking-wider flex items-center gap-2">
          <UserCheck size={16} className="text-purple-600" /> Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { key: 'full_name', label: 'FULL NAME', val: displayName },
            { key: 'mobile', label: 'MOBILE NUMBER', val: profile?.mobile || '9876543211', icon: Phone },
            { key: 'email', label: 'EMAIL ADDRESS', val: profile?.email, icon: Mail, disabled: true },
            { key: 'district', label: 'DISTRICT', val: userDistrict },
            ...(!isWorkUser ? [
              { key: 'taluk', label: 'TALUK / AREA', val: form.taluk || profile?.taluk || profile?.place || 'Gandhipuram' },
              { key: 'city', label: 'CITY / TOWN', val: profile?.city || 'Coimbatore', icon: MapPin },
              { key: 'door_no', label: 'FLAT / DOOR NO / BUILDING NAME', val: form.door_no || (form.address ? form.address.split(',')[0] : 'Gandhipuram') },
              { key: 'street', label: 'STREET / AREA / LOCALITY', val: form.street || (form.address ? form.address.split(',')[1] : 'Coimbatore') },
              { key: 'landmark', label: 'LANDMARK', val: form.landmark || 'Opposite to Govt School' },
            ] : [
              { key: 'city', label: 'CITY', val: profile?.city || '—', icon: MapPin },
            ]),
            { key: 'address', label: 'FULL ADDRESS', val: profile?.address || profile?.location || `${userDistrict}, Tamil Nadu` },
            { key: 'pincode', label: 'PINCODE', val: profile?.pincode || '—' },
            { key: 'state', label: 'STATE', val: profile?.state || 'Tamil Nadu' },
          ].map(field => (
            <div key={field.key} className={field.key === 'address' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                {field.label}
              </label>
              {editing && !field.disabled ? (
                <input 
                  type="text" 
                  value={form[field.key] || ''} 
                  onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))} 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800">{form[field.key] || field.val || '—'}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Work Information Card for Worker & Department Head */}
      {isWorkUser && (
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs">
          <h3 className="font-bold text-gray-900 mb-5 text-base">Work Information</h3>
          <div className="space-y-4">
            {[
              {
                icon: Briefcase,
                label: 'Department',
                value: deptDefault,
              },
              {
                icon: BadgeCheck,
                label: 'Designation',
                value: profile?.designation || (isDeptHead ? `${deptDefault.replace(' Dept', '').replace(' Board', '')} Head` : 'Senior Road Inspector'),
              },
              {
                icon: CreditCard,
                label: 'Worker Code',
                value: profile?.workerIdCode || (isDeptHead 
                  ? `W-${userDistrict.replace(/[^a-zA-Z]/g, '').toUpperCase()}-${deptDefault.replace(/[^a-zA-Z]/g, '').toUpperCase()}-HEAD`
                  : (profile?.email ? `W-${profile.email.split('@')[0].toUpperCase()}` : 'W-ROAD-COE')),
              },
              {
                icon: Calendar,
                label: 'Date of Joining',
                value: profile?.dateOfJoining || profile?.joining_date || '12 May 2021',
              },
              {
                icon: Clock,
                label: 'Experience (Years)',
                value: profile?.experience || '7 Years',
              },
              {
                icon: MapPin,
                label: 'Work Zone / Area',
                value: profile?.workZone || `${userDistrict} City - Zone 5`,
              },
              {
                icon: UserCheck,
                label: 'Reporting Officer',
                value: profile?.reportingOfficer || `Executive Engineer, ${deptDefault}`,
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
