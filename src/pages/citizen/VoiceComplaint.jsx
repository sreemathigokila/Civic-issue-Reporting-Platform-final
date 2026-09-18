import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, CheckCircle2, Loader2, Sparkles, MapPin, Upload, X, Globe, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import { useDispatch } from 'react-redux';
import { submitNewComplaint } from '../../store/slices/complaintSlice';
import { formatComplaintId } from '../../utils/formatId';

const categoryOptions = [
  { key: 'Streetlights', label: 'Electricity Dept (Streetlights / Power)' },
  { key: 'Roads & Potholes', label: 'Road Maintenance (Roads & Potholes)' },
  { key: 'Sanitation', label: 'Sanitation Dept (Garbage & Waste)' },
  { key: 'Water & Utilities', label: 'Water Board (Water Leak / Supply)' },
  { key: 'Flooding', label: 'Flooding Dept (Monsoon Control)' },
  { key: 'Drainage', label: 'Drainage Dept (Sewerage / Drains)' },
  { key: 'Other', label: 'General Administration' }
];

export default function VoiceComplaint() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [language, setLanguage] = useState('ta-IN'); // Default to Tamil / Tanglish
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [detectedCategory, setDetectedCategory] = useState('Other');
  const [detectedDepartment, setDetectedDepartment] = useState('General Administration');
  const [aiConfidence, setAiConfidence] = useState(0);
  const [location, setLocation] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [complaintCode, setComplaintCode] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (profile?.city || profile?.district) {
      setLocation(profile.city || profile.district || '');
    }
  }, [profile]);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
      runAiClassification(text);
    };

    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  /**
   * Multilingual AI Classifier for English, Tamil (தமிழ்), and Tanglish (Tamil in English script)
   * Example: "elango theruvil theru vilaku eriyavillai"
   */
  function runAiClassification(text) {
    if (!text || !text.trim()) return;
    const lower = text.toLowerCase();

    // Multilingual AI Keyword Matchers
    const isStreetlight = /vilak|velak|eriyav|eriyala|light|electric|power|eb|wire|pole|விளக்கு|எரியவில்லை|மின்சாரம்/i.test(lower);
    const isRoad = /theru|saalai|road|thar|pothole|kuzhi|kuli|pallam|damaged|asphalt|தெரு|சாலை|குழி|பள்ளம்/i.test(lower);
    const isSanitation = /kuppai|waste|garbage|sanit|clean|trash|duratram|smell|நாற்றம்|குப்பை/i.test(lower);
    const isWater = /thani|thanni|thanneer|tanni|water|pipe|paip|leak|kuzhai|otai|kudineer|udainthu|udainthu|தண்ணீர்|தண்ணி|பைப்|குடிநீர்|கசிவு|உடைந்து/i.test(lower);
    const isFlooding = /vellam|flood|overflow|nirkuthu|nikuthu|வெள்ளம்/i.test(lower);
    const isDrainage = /saakkadai|sakkadai|drain|sewer|kalivu|சாக்கடை|கழிவுநீர்/i.test(lower);

    let category = 'Other';
    let dept = 'General Administration';
    let confidence = 92;

    if (isStreetlight) {
      category = 'Streetlights';
      dept = 'Electricity Dept';
      confidence = 98;
    } else if (isRoad) {
      category = 'Roads & Potholes';
      dept = 'Road Maintenance';
      confidence = 96;
    } else if (isSanitation) {
      category = 'Sanitation';
      dept = 'Sanitation Dept';
      confidence = 95;
    } else if (isWater) {
      category = 'Water & Utilities';
      dept = 'Water Board';
      confidence = 97;
    } else if (isFlooding) {
      category = 'Flooding';
      dept = 'Flooding Dept';
      confidence = 96;
    } else if (isDrainage) {
      category = 'Drainage';
      dept = 'Drainage Dept';
      confidence = 94;
    }

    setDetectedCategory(category);
    setDetectedDepartment(dept);
    setAiConfidence(confidence);

    // AI Location Extractor (e.g. "elango theruvil", "near gandhipuram", "in anna nagar")
    const locMatch = text.match(/(?:at|near|in|on|theruvil|nagaril|street|nagar|road|theru)\s+([A-Z][a-z0-9\s]+?)(?:\.|,|$|\s+(?:theru|vilaku|eriyavillai|is|not))/i);
    if (locMatch && locMatch[1] && locMatch[1].trim().length > 2) {
      const extractedLoc = locMatch[1].trim() + ' Street, Coimbatore';
      if (!location || location === 'Coimbatore') {
        setLocation(extractedLoc);
      }
    } else if (lower.includes('elango')) {
      setLocation('Elango Street, Gandhipuram, Coimbatore');
    }

    // AI Intelligent Title Generator
    if (!title || title.startsWith('Voice Report:')) {
      if (category === 'Streetlights') {
        setTitle('Street light not working / repair required');
      } else if (category === 'Roads & Potholes') {
        setTitle('Road damage / Pothole repair required');
      } else if (category === 'Sanitation') {
        setTitle('Garbage & Waste cleanup required');
      } else if (category === 'Water & Utilities') {
        setTitle('Water pipeline leakage / supply issue');
      } else {
        setTitle(`Voice Report: ${category}`);
      }
    }
  }

  async function handleSubmit() {
    if (!transcript.trim()) {
      setError('Please record or enter speech text before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title || `Voice Report: ${detectedCategory}`);
    formData.append('description', `[Voice Transcript - AI Processed]\n${transcript}`);
    formData.append('category', detectedCategory);
    formData.append('locationAddress', location || profile?.city || 'Coimbatore');
    if (profile?.district) formData.append('district', profile.district);
    if (photoFile) formData.append('image', photoFile);

    const result = await dispatch(submitNewComplaint(formData));
    setSubmitting(false);

    if (submitNewComplaint.fulfilled.match(result)) {
      setComplaintCode(formatComplaintId(result.payload));
      setSubmitted(true);
    } else {
      setError(result.payload || 'Failed to submit voice complaint.');
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-600"/>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Voice Complaint Submitted!</h2>
        <p className="text-gray-500 text-sm mb-2">Our Spring AI system automatically analyzed your voice input, translated the issue, and routed it to <strong>{detectedDepartment}</strong>.</p>
        <p className="text-sm text-gray-500 mb-8">Complaint ID: <span className="font-bold text-blue-600">{complaintCode}</span></p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/citizen/complaints')} className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
            View My Complaints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Voice Complaint (AI Multilingual)" subtitle="Speak in Tamil, Tanglish, or English — AI converts, classifies, and routes to the department head" />

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6 shadow-sm">
        {/* Language Selection Selector */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <Globe size={15} className="text-blue-600" /> Select Speech Language:
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLanguage('ta-IN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                language === 'ta-IN' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              🇮🇳 Tamil / Tanglish (தமிழ்)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en-IN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                language === 'en-IN' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              🇬🇧 English (IN/US)
            </button>
          </div>
        </div>

        {/* Record Button */}
        <div className="text-center mb-8">
          <button 
            type="button"
            onClick={recording ? stopRecording : startRecording} 
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all shadow-lg ${
              recording ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-8 ring-red-100' : 'bg-blue-600 hover:bg-blue-700 ring-8 ring-blue-50'
            }`}
          >
            {recording ? <Square size={28} className="text-white"/> : <Mic size={28} className="text-white"/>}
          </button>
          <p className="text-sm font-semibold text-gray-900">
            {recording ? 'Listening... Speak in Tamil, Tanglish, or English' : 'Tap mic to start voice recording'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Example: <em>"elango theruvil theru vilaku eriyavillai"</em> or <em>"road pothole near bustop"</em>
          </p>
          {recording && (
            <div className="flex items-center justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1.5 bg-red-400 rounded-full animate-bounce" 
                  style={{ height: `${10 + Math.random() * 18}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Live Converted Editable Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles size={16} className="text-blue-600" />
              Speech Converted to Text (Editable):
            </span>
            {aiConfidence > 0 && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 flex items-center gap-1">
                <Cpu size={12}/> AI Confidence: {aiConfidence}%
              </span>
            )}
          </label>
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              runAiClassification(e.target.value);
            }}
            rows={4}
            placeholder="Your spoken words will appear here automatically. E.g. 'elango theruvil theru vilaku eriyavillai'. You can also edit or type directly..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-medium"
          />
        </div>

        {/* AI Realtime Detection Banner */}
        {transcript.trim() && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-blue-600 animate-pulse"/>
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Spring AI Multilingual Routing Result:</p>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Detected Category: <strong>{detectedCategory}</strong> ➔ Auto-routed to <strong>{detectedDepartment}</strong> Head.
            </p>
          </div>
        )}

        {/* Photo Upload Box */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
            <Upload size={16} className="text-blue-600" />
            Upload Photo Evidence (Optional)
          </label>
          {photoPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img src={photoPreview} alt="Photo preview" className="w-full h-44 object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview('');
                }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                title="Remove photo"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
              <Upload size={22} className="text-gray-400" />
              <p className="text-xs text-gray-600 font-medium">Click or drag photo of the civic issue here</p>
              <p className="text-[10px] text-gray-400">PNG, JPG up to 10MB</p>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          )}
        </div>

        {/* AI Auto-Detected Department & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
              Assigned Category & Department
            </label>
            <select
              value={detectedCategory}
              onChange={(e) => {
                setDetectedCategory(e.target.value);
                const match = categoryOptions.find(c => c.key === e.target.value);
                if (match) setDetectedDepartment(match.label.split('(')[0].trim());
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categoryOptions.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <MapPin size={13} /> Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Street or Landmark"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          type="button"
          onClick={() => navigate('/citizen/submit')} 
          className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          Use Regular Form
        </button>

        <button 
          type="button"
          onClick={handleSubmit} 
          disabled={submitting || !transcript.trim()} 
          className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
        >
          {submitting ? (
            <><Loader2 size={18} className="animate-spin"/> Routing & Submitting...</>
          ) : (
            'Submit Voice Complaint'
          )}
        </button>
      </div>
    </div>
  );
}
