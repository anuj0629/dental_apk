import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LockKeyhole, Mail, ShieldCheck, Stethoscope, UserRound } from 'lucide-react';
import { useAuth } from '../state/AuthContext.jsx';
import { apiError } from '../api/client.js';

export default function LoginPage() {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email, password, role });
      toast.success(`Welcome back, ${user.name}`);
      navigate(user.role === 'admin' ? '/admin' : '/user', { replace: true });
    } catch (error) {
      toast.error(apiError(error, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-clinical-50 to-slate-100 px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-lg border border-clinical-100 bg-white px-4 py-3 shadow-sm">
              <Stethoscope className="text-clinical-600" size={24} />
              <span className="text-sm font-bold text-slate-900">AI-based Dental Disease Detection System</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight text-slate-950">Clinical X-ray analysis with secure patient history.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Upload dental radiographs, review AI-assisted detections, and manage patient records from a responsive medical dashboard.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {['Caries detection', 'Periapical lesion detection', 'Bounding boxes', 'Patient history'].map((item) => (
                <div key={item} className="rounded-lg border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel mx-auto w-full max-w-md p-5 sm:p-7">
          <div className="mb-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-clinical-600 text-white">
              <Stethoscope size={28} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">Select your role to continue.</p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            {[
              { value: 'admin', label: 'Admin', icon: ShieldCheck },
              { value: 'user', label: 'User', icon: UserRound }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-bold transition ${
                    role === item.value ? 'bg-white text-clinical-700 shadow-sm' : 'text-slate-500'
                  }`}
                  onClick={() => setRole(item.value)}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="label">Email</span>
              <span className="relative mt-1.5 block">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="field pl-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </span>
            </label>
            <label className="block">
              <span className="label">Password</span>
              <span className="relative mt-1.5 block">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="field pl-10" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </span>
            </label>
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : `Login as ${role === 'admin' ? 'Admin' : 'User'}`}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
