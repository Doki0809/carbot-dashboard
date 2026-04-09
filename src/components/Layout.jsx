import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── SVG Icons ─────────────────────────────────────────────────────────── */
const IconDealers = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconAnalytics = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconPlayground = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconChannels = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const IconAPIs = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);
const IconSkills = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
    <path d="M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07"/>
  </svg>
);
const IconKnowledge = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);
const IconBot = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);
const IconChevron = ({ open }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 220ms cubic-bezier(0.25,0.46,0.45,0.94)' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IconTrash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
const IconCollapse = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/>
  </svg>
);
const IconExpand = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M13 17l5-5-5-5"/><path d="M6 17l5-5-5-5"/>
  </svg>
);

/* ── Nav config ────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { to: '/dealers',    label: 'DEALERS',    Icon: IconDealers },
  { to: '/analytics',  label: 'METRICS',    Icon: IconAnalytics },
  { to: '/channels',   label: 'CANALES',    Icon: IconChannels },
  { to: '/apis',       label: 'APIS',       Icon: IconAPIs },
  {
    to: '/assistant',
    label: 'ASISTEN',
    Icon: IconBot,
  },
];



/* ── Single nav item ───────────────────────────────────────────────────── */
function NavItem({ link, active }) {
  return (
    <Link
      to={link.to}
      className={`mb-3 w-[72px] h-[72px] flex flex-col items-center justify-center gap-1.5 rounded-[1.25rem] transition-all duration-300 ${
        active
          ? 'bg-[#ff3b45] text-white shadow-[0_8px_16px_rgba(255,59,69,0.3)]'
          : 'bg-transparent text-white/40 hover:text-white/80 hover:bg-white/5'
      }`}
    >
      <span className={`shrink-0 ${active ? 'scale-110' : ''}`}>
        <link.Icon />
      </span>
      <span className="text-[9px] font-[800] uppercase tracking-wider">{link.label}</span>
    </Link>
  );
}

/* ── Layout ────────────────────────────────────────────────────────────── */
export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#090a0f] relative text-white" style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Sidebar estrecha CRM ────────────────────────────────────── */}
      <aside className="sticky top-0 h-screen w-[95px] min-w-[95px] flex flex-col z-30 overflow-hidden bg-[#0e1015] border-r border-transparent shadow-2xl">
        <div className="relative flex flex-col h-full items-center py-6 gap-2">
          {/* Brand header */}
          <Link to="/dealers" className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 flex items-center justify-center">
               <img src="/3.png" alt="Logo" className="w-[80%] h-[80%] object-contain" style={{ filter: 'drop-shadow(0px 4px 6px rgba(255,0,0,0.4))' }} />
            </div>
          </Link>

          {/* Menú Scrollable */}
          <nav className="flex-1 flex flex-col items-center w-full overflow-y-auto scrollbar-hide py-1">
            {NAV_LINKS.map((link) => (
                <NavItem
                  key={link.to}
                  link={link}
                  active={location.pathname.startsWith(link.to)}
                />
            ))}
          </nav>

          {/* User footer */}
          <div className="flex flex-col items-center mt-auto w-full gap-4 shrink-0">
            <button 
              onClick={handleLogout} 
              title="Cerrar sesión" 
              className="text-white/30 hover:text-[#ff4d4d] transition-all p-3 rounded-2xl hover:bg-white/5 flex items-center justify-center"
            >
              <IconLogout />
            </button>
            <div className="w-12 h-12 rounded-[1.1rem] overflow-hidden shadow-lg border border-white/10">
               <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=151720&color=ff4d4d&bold=true`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 px-8 py-10 overflow-auto h-screen relative bg-[#090a0f]">
        {children}
      </main>
    </div>
  );
}
