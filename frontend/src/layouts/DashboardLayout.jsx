import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronLeft, ChevronRight, LogOut, LayoutDashboard,
  FileText, HelpCircle, Brain, Trophy, BarChart3, GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ipeLinks = [
  { to: '/ipe/syllabus', label: 'Syllabus', icon: BookOpen },
  { to: '/ipe/pyq', label: 'Previous Year Papers', icon: FileText },
  { to: '/ipe/important', label: 'Important Questions', icon: HelpCircle },
];

const eamcetLinks = [
  { to: '/eamcet/syllabus', label: 'Syllabus', icon: BookOpen },
  { to: '/eamcet/pyq', label: 'Previous Papers', icon: FileText },
  { to: '/eamcet/quiz', label: 'Quiz', icon: Brain },
  { to: '/eamcet/mock', label: 'Mock Test', icon: Trophy },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [ipeOpen, setIpeOpen] = useState(true);
  const [eamcetOpen, setEamcetOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ to, label, icon: Icon }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl transition text-sm ${
          isActive ? 'bg-gold text-navy font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon size={18} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );

  return (
    <div className="min-h-screen flex bg-white">
      <motion.aside
        animate={{ width: collapsed ? 72 : 280 }}
        className="bg-navy text-white flex flex-col shrink-0 overflow-hidden"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="font-bold text-gold text-sm leading-tight">AP Inter & EAMCET</h1>
              <p className="text-xs text-white/60">Smart Preparation</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-white/10 rounded-lg">
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          <NavItem to="/dashboard" label="Dashboard" icon={LayoutDashboard} />

          <button
            onClick={() => setIpeOpen(!ipeOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-gold font-bold text-xs uppercase tracking-wider"
          >
            {!collapsed && 'IPE'}
            {!collapsed && <span>{ipeOpen ? '−' : '+'}</span>}
          </button>
          <AnimatePresence>
            {ipeOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="space-y-1">
                {ipeLinks.map((l) => <NavItem key={l.to} {...l} />)}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setEamcetOpen(!eamcetOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-gold font-bold text-xs uppercase tracking-wider mt-4"
          >
            {!collapsed && 'EAMCET'}
            {!collapsed && <span>{eamcetOpen ? '−' : '+'}</span>}
          </button>
          <AnimatePresence>
            {eamcetOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="space-y-1">
                {eamcetLinks.map((l) => <NavItem key={l.to} {...l} />)}
              </motion.div>
            )}
          </AnimatePresence>

          <NavItem to="/analytics" label="Analytics" icon={BarChart3} />
        </nav>

        <div className="p-4 border-t border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="text-gold" size={20} />
              <div className="text-sm truncate">
                <p className="font-medium">{user?.name}</p>
                <p className="text-white/50 text-xs">{user?.pin}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-sm"
          >
            <LogOut size={18} />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-navy/10 px-8 py-4 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-navy">Welcome, {user?.name}</h2>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
