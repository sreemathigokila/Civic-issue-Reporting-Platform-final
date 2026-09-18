import { useState, useEffect, useMemo } from 'react';
import StatCard from '../../components/ui/StatCard';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle2, Zap, BarChart2, ArrowRight, Smartphone, Shield, Clock, Star, ChevronRight } from 'lucide-react';
import afterRoadImg from '../../assets/after_road.jpg';
import api from '../../api/axios';

const mockComplaints = [
  { id: 'C1001', title: 'Pothole on Main Road', location: 'Sector 12', status: 'Resolved', department: 'Road Maintenance' },
  { id: 'C1002', title: 'Overflowing trash bin', location: 'Market Street', status: 'In Progress', department: 'Sanitation' },
  { id: 'C1003', title: 'Broken streetlight', location: 'Tower Avenue', status: 'Assigned', department: 'Electricity Dept' },
  { id: 'C1004', title: 'Water leakage', location: 'Riverside', status: 'Pending', department: 'Water Board' },
  { id: 'C1005', title: 'Traffic signal issue', location: 'Central Junction', status: 'Resolved', department: 'Traffic Dept' },
  { id: 'C1006', title: 'Drain blockage', location: 'Oak Park', status: 'Resolved', department: 'Drainage Dept' },
  { id: 'C1007', title: 'Road Waterlogging & Flooding', location: 'Gandhipuram', status: 'Resolved', department: 'Flooding Dept' },
];

const features = [
  {
    icon: Smartphone,
    title: 'Easy Reporting',
    desc: 'Submit civic issues with photos and precise location in seconds.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Zap,
    title: 'AI Smart Routing',
    desc: 'Our AI analyzes and routes your complaint to the correct department automatically.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: BarChart2,
    title: 'Real-time Tracking',
    desc: 'Track progress from submission to resolution with live status updates.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Shield,
    title: 'Verified Resolution',
    desc: 'Before & after photo comparison ensures quality resolutions every time.',
    color: 'bg-purple-100 text-purple-600',
  },
];

const steps = [
  { num: '01', title: 'Report', desc: 'Submit civic issues with photos and location.', icon: Smartphone },
  { num: '02', title: 'Analyze', desc: 'Our AI system analyzes and categorizes the issue.', icon: Zap },
  { num: '03', title: 'Assign', desc: 'The issue is assigned to the relevant department.', icon: CheckCircle2 },
  { num: '04', title: 'Resolve', desc: 'Track progress until the issue is resolved.', icon: Clock },
];

export default function Home() {
  const [liveStats, setLiveStats] = useState({
    issuesReported: 9,
    issuesResolved: 4,
    departments: 7,
    satisfactionRate: 94,
  });

  useEffect(() => {
    async function fetchLiveStats() {
      try {
        const res = await api.get('/complaints/stats');
        if (res.data) {
          setLiveStats({
            issuesReported: res.data.issuesReported || 9,
            issuesResolved: res.data.issuesResolved || 4,
            departments: res.data.departments || 7,
            satisfactionRate: res.data.satisfactionRate || 94,
          });
        }
      } catch (err) {
        try {
          const res = await api.get('/complaints/admin');
          if (Array.isArray(res.data)) {
            const total = res.data.length;
            const resolved = res.data.filter((c) =>
              ['RESOLVED', 'CLOSED', 'CITIZEN_APPROVED', 'SUBMITTED_FOR_REVIEW', 'Resolved'].includes(c.status)
            ).length;
            setLiveStats((prev) => ({
              ...prev,
              issuesReported: total > 0 ? total : prev.issuesReported,
              issuesResolved: resolved > 0 ? resolved : prev.issuesResolved,
            }));
          }
        } catch (e) {
          console.warn('Fallback to default live stats');
        }
      }
    }
    fetchLiveStats();
  }, []);

  const stats = useMemo(() => {
    return [
      { value: `${liveStats.issuesReported}+`, label: 'Issues Reported' },
      { value: `${liveStats.issuesResolved}+`, label: 'Issues Resolved' },
      { value: `${liveStats.departments}`, label: 'Departments' },
      { value: `${liveStats.satisfactionRate}%`, label: 'Satisfaction Rate' },
    ];
  }, [liveStats]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-bold text-purple-950 text-lg">CivicConnect</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#about" className="hover:text-purple-900 transition-colors">
              About
            </a>
            <a href="#how" className="hover:text-purple-900 transition-colors">
              How it Works
            </a>
            <a href="#features" className="hover:text-purple-900 transition-colors">
              Features
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-purple-900 px-3 py-2">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-purple-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              Register
            </Link>
          </div>
        </div>
      </header>
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-100 via-purple-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Zap size={12} /> Smart Civic Issue Reporting
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Together for a<br />
                <span className="text-purple-600">Better City</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Report civic issues, track their status, and help us build a cleaner, safer, and smarter city. Powered by AI for instant routing and resolution.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                >
                  Start Reporting <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-purple-50/50 transition-colors"
                >
                  Track Complaint
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10">
                {stats.slice(0, 2).map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Issue Resolved!</p>
                    <p className="text-xs text-gray-500">Pothole on Main Road</p>
                  </div>
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    Resolved
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="relative rounded-xl overflow-hidden h-28 border border-gray-200 shadow-sm group">
                    <img
                      src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80"
                      alt="Before Repair"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded shadow tracking-wide">
                      BEFORE
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden h-28 border border-emerald-300 shadow-sm group">
                    <img
                      src={afterRoadImg}
                      alt="After Repair"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow tracking-wide flex items-center gap-1">
                      <CheckCircle2 size={10} /> AFTER
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {['Complaint Submitted', 'Assigned to Dept', 'Work in Progress', 'Resolved'].map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          i < 4 ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      >
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                      <span className="text-xs text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-purple-600 text-white rounded-xl p-3 shadow-lg">
                <MapPin size={20} />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white border border-gray-100 rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold text-gray-700">{liveStats.satisfactionRate}% resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Stats */}
      <section className="py-12 bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <StatCard key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>
      {/* About */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-purple-950 mb-4">About CivicConnect</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              CivicConnect is a crowdsourced civic issue reporting platform that connects citizens with local government authorities.
              Our platform enables residents to report infrastructure problems, track resolution status, and collaborate with civic bodies
              to build a better community — all powered by AI-driven smart routing.
            </p>
          </div>
        </div>
      </section>
      {/* How it Works */}
      <section id="how" className="py-20 px-4 sm:px-6 lg:px-8 bg-purple-50/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-purple-950 mb-3">How it Works</h2>
            <p className="text-gray-600">Simple steps to get your civic issues resolved</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-0 h-0.5 bg-purple-200" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-200">
                    <step.icon size={24} className="text-white" />
                  </div>
                  <span className="text-purple-600 font-bold text-sm mb-1">{step.num}</span>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-purple-950 mb-3">Platform Features</h2>
            <p className="text-gray-600">Everything you need for effective civic participation</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-purple-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start reporting civic issues today</h2>
          <p className="text-purple-200 mb-8 text-lg">Join thousands of citizens making their city better, one report at a time.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-3 rounded-xl hover:bg-purple-50 transition-colors shadow-lg"
          >
            Create your account <ChevronRight size={18} />
          </Link>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-100 text-center text-sm text-gray-500">
        <p>© 2026 CivicConnect. Building better cities together.</p>
      </footer>
    </div>
  );
}
