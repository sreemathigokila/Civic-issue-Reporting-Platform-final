import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, CheckCircle2, Loader2, X, Bell, Mic, MicOff, Sparkles, Navigation, FileText, Camera, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDispatch } from 'react-redux';
import { submitNewComplaint } from '../../store/slices/complaintSlice';
import PageHeader from '../../components/ui/PageHeader';
import { tnDistrictsData } from '../../data/tnDistrictsData';
import { formatComplaintId } from '../../utils/formatId';

const districts = Object.keys(tnDistrictsData);

const categories = [
  { key: 'Electricity & Streetlights', emoji: '💡' },
  { key: 'Roads & Potholes', emoji: '🛣️' },
  { key: 'Sanitation', emoji: '🗑️' },
  { key: 'Water & Utilities', emoji: '💧' },
  { key: 'Flooding', emoji: '🌊' },
  { key: 'Drainage', emoji: '🕳️' },
  { key: 'Other', emoji: '📋' },
];

const categoryToDept = {
  'Electricity & Streetlights': 'Electricity Dept',
  'Roads & Potholes': 'Road Maintenance',
  'Sanitation': 'Sanitation Dept',
  'Water & Utilities': 'Water Board',
  'Flooding': 'Flooding Dept',
  'Drainage': 'Drainage Dept',
  'Other': 'General Administration',
};

export default function SubmitComplaint() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [district, setDistrict] = useState('Coimbatore');
  const [selectedTaluk, setSelectedTaluk] = useState('Gandhipuram');
  const [mapPin, setMapPin] = useState({ x: 50, y: 50 });
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electricity & Streetlights');
  
  // Photo State
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [recognition, setRecognition] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState('');

  useEffect(() => {
    const availableTaluks = tnDistrictsData[district] || [];
    if (availableTaluks.length > 0) {
      setSelectedTaluk(availableTaluks[0]);
      setLocation(`${availableTaluks[0]}, ${district}`);
    }
  }, [district]);

  useEffect(() => {
    if (!location && profile) {
      setLocation(profile.location || profile.city || 'Gandhipuram, Coimbatore');
    }
    if (profile?.district) {
      setDistrict(profile.district);
    }
  }, [profile]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN';

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceText(transcript);
        if (!description) {
          setDescription(transcript);
        }
      };

      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      setRecognition(rec);
    }
  }, [description]);

  function handleGPS() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation(`Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)} (GPS Verified)`);
      });
    }
  }

  function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPhotoFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPhotoPreviews((prev) => [...prev, ...previews]);
  }

  function removePhoto(index) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleVoice() {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description + (voiceText ? `\n[Voice Transcript]: ${voiceText}` : ''));
    formData.append('category', category);
    formData.append('locationAddress', location);
    formData.append('district', district);
    if (photoFiles.length > 0) {
      formData.append('image', photoFiles[0]);
    }

    const result = await dispatch(submitNewComplaint(formData));
    setSubmitting(false);

    if (submitNewComplaint.fulfilled.match(result)) {
      setSubmittedId(formatComplaintId(result.payload));
      setStep('success');
    } else {
      setError(result.payload || 'Failed to submit complaint');
    }
  }

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted Successfully!</h2>
        <p className="text-gray-500 mb-2">
          Complaint ID: <span className="font-bold text-blue-600">{submittedId}</span>
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Spring AI analyzed your report and automatically routed it to the <strong>{categoryToDept[category]}</strong> Head for <strong>{district}</strong>.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 text-left flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-xl text-blue-600 flex-shrink-0 mt-0.5">
            <Bell size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">In-App & Email Notification Sent</p>
            <p className="text-xs text-blue-700 mt-0.5">
              You will receive real-time updates as workers are assigned and work progresses.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate('/citizen/complaints')}
            className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
          >
            View My Complaints
          </button>
          <button
            onClick={() => navigate('/citizen/track')}
            className="bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Track Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Report a New Civic Issue" subtitle="Follow the 6-step AI-guided workflow" />

      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-sm">
        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s}
              </div>
              <span className={`text-xs font-semibold ${step >= s ? 'text-purple-950' : 'text-gray-400'}`}>
                {s === 1 ? 'District' : s === 2 ? 'Location' : s === 3 ? 'Details' : s === 4 ? 'Photos' : s === 5 ? 'Voice' : 'AI Review'}
              </span>
              {s < 6 && <div className={`w-4 h-0.5 ${step > s ? 'bg-purple-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* STEP 1: District */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-purple-950 text-lg mb-2">Step 1: Select District</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {districts.map((d) => (
                <button
                  key={d}
                  onClick={() => setDistrict(d)}
                  className={`p-4 rounded-xl border-2 font-semibold text-sm transition-all flex items-center gap-2 ${
                    district === d ? 'border-purple-600 bg-purple-50 text-purple-950 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Building2 size={16} className={district === d ? 'text-purple-600' : 'text-gray-400'} />
                  {d}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors mt-4 shadow-sm"
            >
              Continue to Location
            </button>
          </div>
        )}

        {/* STEP 2: Location */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-purple-950 text-lg">Step 2: Choose Location in {district}</h2>
                <p className="text-xs text-gray-500">Select Taluk, pick on map, or use GPS auto-detect</p>
              </div>
              <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                District: {district}
              </span>
            </div>

            {/* Taluk / Place Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                Select Taluk / Locality in {district} *
              </label>
              <select
                value={selectedTaluk}
                onChange={(e) => {
                  setSelectedTaluk(e.target.value);
                  setLocation(`${e.target.value}, ${district}`);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {(tnDistrictsData[district] || ['Main Town', 'Central Area']).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Landmark / Specific Address Input */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                Specific Landmark or Street Address
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Near Belur Bus Stand, Main Road, Opposite Post Office"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Interactive Visual Map Location Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Interactive Map Pin Location
                </label>
                <span className="text-[11px] text-purple-700 font-medium">Click anywhere on map to drop pin</span>
              </div>

              <div 
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setMapPin({ x, y });
                  if (!location || location.includes('GPS')) {
                    setLocation(`${selectedTaluk || 'Pin Location'}, ${district}`);
                  }
                }}
                className="w-full h-52 bg-slate-900 rounded-xl border border-gray-300 relative overflow-hidden cursor-crosshair group shadow-inner"
                style={{
                  backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }}
              >
                {/* Map Grid Roads Visualization */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-1/3 left-0 right-0 h-3 bg-purple-400/40 transform -skew-y-3" />
                  <div className="absolute top-2/3 left-0 right-0 h-4 bg-emerald-400/40 transform skew-y-2" />
                  <div className="absolute left-1/3 top-0 bottom-0 w-3 bg-amber-400/40 transform skew-x-6" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-4 bg-purple-400/40 transform -skew-x-3" />
                </div>

                {/* Animated Drop Pin */}
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 pointer-events-none flex flex-col items-center"
                  style={{ left: `${mapPin.x}%`, top: `${mapPin.y}%` }}
                >
                  <div className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg mb-1 whitespace-nowrap border border-purple-400 flex items-center gap-1">
                    <MapPin size={10} className="text-amber-300 fill-amber-300" />
                    {location || 'Selected Pin'}
                  </div>
                  <MapPin size={32} className="text-red-500 drop-shadow-lg animate-bounce" />
                  <div className="w-3 h-1.5 bg-black/40 rounded-full blur-[1px]" />
                </div>

                {/* Map Control Bar Overlay */}
                <div className="absolute bottom-2 left-2 right-2 bg-slate-800/90 backdrop-blur text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs pointer-events-none border border-slate-700">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
                    <MapPin size={12} className="text-red-400" />
                    Pinned Location: <strong className="text-white ml-0.5">{location || `${district} Central`}</strong>
                  </span>
                  <span className="text-[10px] text-purple-300 font-mono">
                    Lat: {(11.0168 + (mapPin.y / 1000)).toFixed(4)}° N, Long: {(76.9558 + (mapPin.x / 1000)).toFixed(4)}° E
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (!location) {
                    setLocation(`${selectedTaluk || 'Main Area'}, ${district}`);
                  }
                  setStep(3);
                }} 
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md"
              >
                Continue to Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Issue Category & Details */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-bold text-purple-950 text-lg mb-2">Step 3: Category & Details</h2>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Select Issue Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 ${
                      category === c.key ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold' : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    <span>{c.emoji}</span> {c.key}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Issue Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Street light not working on Elango Street"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Provide detailed description of the issue..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl">Back</button>
              <button
                onClick={() => {
                  if (!title) return setError('Title is required');
                  setError('');
                  setStep(4);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-sm"
              >
                Continue to Photos
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Upload Evidence */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-bold text-purple-950 text-lg mb-2">Step 4: Upload Evidence</h2>
            
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {photoPreviews.map((p, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img src={p} alt="evidence" className="w-full h-28 object-cover" />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center gap-2 p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <Camera size={28} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">Drop photos or click to select</p>
              <p className="text-xs text-gray-400">JPG, PNG, JPEG up to 10MB</p>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            </label>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(3)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl">Back</button>
              <button onClick={() => setStep(5)} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-sm">Continue to Voice</button>
            </div>
          </div>
        )}

        {/* STEP 5: Voice Complaint */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-bold text-purple-950 text-lg mb-2">Step 5: Voice Recording (Optional)</h2>
            <p className="text-xs text-gray-500">Record voice in Tamil, Tanglish, or English. AI will transcribe and refine it.</p>

            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 text-center">
              <button
                onClick={toggleVoice}
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-all ${
                  isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg ring-4 ring-red-200' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20'
                }`}
              >
                {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
              </button>
              <p className="text-xs font-semibold text-gray-700">
                {isRecording ? 'Listening... Speak now' : 'Click microphone to record voice'}
              </p>
            </div>

            {voiceText && (
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Generated Speech Transcript (Editable)</label>
                <textarea
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(4)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl">Back</button>
              <button onClick={() => setStep(6)} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-sm">Review & AI Analysis</button>
            </div>
          </div>
        )}

        {/* STEP 6: Review & AI Analysis */}
        {step === 6 && (
          <div className="space-y-5">
            <h2 className="font-bold text-purple-950 text-lg mb-2">Step 6: Review & Spring AI Analysis</h2>

            {/* AI Result Card */}
            <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800 text-white p-5 rounded-2xl shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-amber-400" />
                <p className="text-xs font-bold uppercase tracking-wider text-purple-200">Automated AI Classification</p>
                <span className="ml-auto text-xs bg-amber-400 text-purple-950 font-bold px-2 py-0.5 rounded-full">98% Confidence</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-purple-700/50 pt-3">
                <div>
                  <p className="text-purple-300">Detected Category</p>
                  <p className="font-bold text-sm text-white">{category}</p>
                </div>
                <div>
                  <p className="text-purple-300">Assigned Department</p>
                  <p className="font-bold text-sm text-white">{categoryToDept[category]}</p>
                </div>
                <div>
                  <p className="text-purple-300">Target District</p>
                  <p className="font-bold text-sm text-white">{district}</p>
                </div>
                <div>
                  <p className="text-purple-300">Priority Level</p>
                  <p className="font-bold text-sm text-amber-300">MEDIUM (Auto-assigned)</p>
                </div>
              </div>
            </div>

            {/* Summary Review */}
            <div className="bg-purple-50/40 border border-purple-100 rounded-xl p-4 space-y-2 text-xs text-gray-700">
              <p><strong>Title:</strong> {title}</p>
              <p><strong>Location:</strong> {location}</p>
              <p><strong>Photos Uploaded:</strong> {photoFiles.length} File(s)</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(5)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl">Back</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : 'Submit Complaint (C1001)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
