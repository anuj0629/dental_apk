import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  History,
  LogOut,
  Menu,
  Pill,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
  UserCircle,
  Users,
  X
} from 'lucide-react';
import { useAuth } from '../state/AuthContext.jsx';

const navItems = {
  admin: [
    { label: 'Dashboard', to: '/admin', icon: BarChart3, end: true },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Records', to: '/admin/records', icon: ClipboardList }
  ],
  user: [
    { label: 'Dashboard', to: '/user', icon: BarChart3, end: true },
    { label: 'New Analysis', to: '/user/analysis/new', icon: UploadCloud },
    { label: 'Patients', to: '/user/patients', icon: Pill },
    { label: 'History', to: '/user/history', icon: History },
    { label: 'Profile', to: '/user/profile', icon: UserCircle }
  ]
};

function Sidebar({ role, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-100 bg-white px-4 py-5 shadow-soft lg:shadow-none">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-clinical-600 text-white">
            <Stethoscope size={22} />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">Dental AI</p>
            <p className="text-xs font-medium uppercase tracking-wide text-clinical-600">{role} portal</p>
          </div>
        </div>
        <button className="btn-secondary p-2 lg:hidden" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <div className="mb-6 rounded-lg border border-clinical-100 bg-clinical-50 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <ShieldCheck size={17} className="text-clinical-600" />
          {user?.name}
        </div>
        <p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems[role].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                  isActive ? 'bg-clinical-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <button className="btn-secondary mt-6 w-full justify-start" onClick={handleLogout}>
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}

export default function DashboardLayout({ role }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-clinical-50 to-slate-100">
      <div className="lg:hidden">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Stethoscope className="text-clinical-600" size={22} />
            Dental AI
          </div>
          <button className="btn-secondary p-2" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full" onClick={(event) => event.stopPropagation()}>
            <Sidebar role={role} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
          <Sidebar role={role} />
        </div>
        <main className="w-full min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
