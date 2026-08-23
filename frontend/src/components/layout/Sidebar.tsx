import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  BrainCircuit,
  BarChart3,
  FileText,
  Zap,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Overview',       to: '/',             icon: <LayoutDashboard size={18} /> },
  { label: 'New Analysis',   to: '/new-analysis', icon: <PlusCircle size={18} /> },
  { label: 'Workspace',      to: '/workspace',    icon: <BrainCircuit size={18} /> },
  { label: 'Agent Insights', to: '/insights',     icon: <BarChart3 size={18} /> },
  { label: 'Reports',        to: '/reports',      icon: <FileText size={18} /> },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-black shrink-0 border-r border-neutral-800">
      {/* Logo / Wordmark */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-neutral-800">
        <div className="w-8 h-8 rounded-lg bg-burgundy flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-white font-extrabold text-base tracking-widest uppercase">
            STRATOS
          </span>
          <span className="text-neutral-400 text-[9px] font-semibold tracking-wider uppercase mt-1">
            Executive AI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 py-5 flex-1">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={[
                'sidebar-link',
                isActive ? 'sidebar-link-active' : 'sidebar-link-default',
              ].join(' ')}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.label === 'New Analysis' && (
                <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-burgundy text-white text-[9px] font-bold">
                  +
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-neutral-800">
        <p className="text-[10px] text-neutral-600 leading-relaxed">
          Multi-agent executive intelligence
        </p>
        <p className="text-[9px] text-neutral-700 mt-0.5">
          Hackathon build · STRATOS
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
