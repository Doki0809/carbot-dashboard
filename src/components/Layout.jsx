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
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
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
    label: 'ASISTEN',
    Icon: IconBot,
    prefix: '/assistant',
    children: [
      { to: '/assistant/playground', label: 'PRUEBA',       Icon: IconPlayground },
      { to: '/assistant/skills',     label: 'SKILLS',       Icon: IconSkills },
      { to: '/assistant/knowledge',  label: 'CONOCIM',      Icon: IconKnowledge },
    ],
  },
];

/* ── Dropdown item ─────────────────────────────────────────────────────── */
function DropdownNav({ link, currentPath }) {
  const [open, setOpen] = useState(false);
  const isActive = currentPath.startsWith(link.prefix);

  return (
    <div className="relative mb-3 flex flex-col items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-[85px] h-[85px] flex flex-col items-center justify-center gap-2 rounded-3xl transition-all duration-300 shadow-md border ${
          isActive
            ? 'bg-gradient-to-br from-[#f42c2c] to-[#e61d1d] text-white border-transparent'
            : 'bg-[#171a23] text-white/40 border-white/5 hover:text-white/90 hover:bg-[#1a1d27] hover:border-white/10'
        }`}
        style={isActive ? { boxShadow: '0 8px 24px rgba(230,48,48,0.3), inset 0 2px 0 rgba(255,255,255,0.2)' } : {}}
      >
        <span className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-125 drop-shadow-md' : ''}`}>
          <link.Icon />
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest mt-1">{link.label}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-2 mt-3 animate-slide-down items-center w-full">
          {link.children.map((child) => {
            const childActive = currentPath.startsWith(child.to);
            return (
              <Link
                key={child.to}
                to={child.to}
                onClick={() => setOpen(false)}
                className={`flex flex-col items-center justify-center w-[75px] h-[75px] rounded-2xl transition-all duration-200 border ${
                  childActive
                    ? 'bg-red-500/10 text-brand-400 border-red-500/20'
                    : 'bg-[#12141a] text-white/30 hover:text-white/70 border-transparent hover:bg-white/5'
                }`}
              >
                <span className={`mb-1 transition-transform ${childActive ? 'scale-110 drop-shadow-md text-brand-400' : ''}`}>
                  <child.Icon />
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Single nav item ───────────────────────────────────────────────────── */
function NavItem({ link, active }) {
  return (
    <Link
      to={link.to}
      className={`mb-3 w-[85px] h-[85px] flex flex-col items-center justify-center gap-2 rounded-3xl transition-all duration-300 shadow-md border ${
        active
          ? 'bg-gradient-to-br from-[#f42c2c] to-[#e61d1d] text-white border-transparent'
          : 'bg-[#171a23] text-white/40 border-white/5 hover:text-white/90 hover:bg-[#1a1d27] hover:border-white/10'
      }`}
      style={active ? { boxShadow: '0 8px 24px rgba(230,48,48,0.3), inset 0 2px 0 rgba(255,255,255,0.2)' } : {}}
    >
      <span className={`shrink-0 transition-transform duration-300 ${active ? 'scale-125 drop-shadow-md' : ''}`}>
        <link.Icon />
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest mt-1">{link.label}</span>
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
    <div className="flex min-h-screen bg-[#0f1117] relative text-white">
      {/* ── Sidebar estrecha CRM ────────────────────────────────────── */}
      <aside className="sticky top-0 h-screen w-[120px] min-w-[120px] flex flex-col z-30 overflow-hidden bg-[#08090d] border-r border-[#1a1d28] shadow-2xl">
        <div className="relative flex flex-col h-full items-center py-6 gap-2">
          {/* Brand header */}
          <Link to="/dealers" className="flex items-center justify-center mb-8">
            <div className="w-14 h-14 rounded-3xl flex items-center justify-center overflow-hidden bg-[#151720] border border-white/10 shadow-lg relative group transition-transform hover:scale-105">
               <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               <img src="/3.png" alt="Logo" className="w-[60%] h-[60%] object-contain drop-shadow-lg" />
            </div>
          </Link>

          {/* Menú Scrollable Oculto */}
          <nav className="flex-1 flex flex-col items-center w-full px-2 overflow-y-auto scrollbar-hide py-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <DropdownNav
                  key={link.label}
                  link={link}
                  currentPath={location.pathname}
                />
              ) : (
                <NavItem
                  key={link.to}
                  link={link}
                  active={location.pathname.startsWith(link.to)}
                />
              )
            )}
          </nav>

          {/* User footer */}
          <div className="flex flex-col items-center mt-4 pt-6 border-t border-white/5 w-full gap-4 shrink-0">
            <div className="flex flex-col items-center gap-1 cursor-default group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#171a23] border border-white/10 shadow-inner overflow-hidden relative">
                 <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=1a1d27&color=e63030&bold=true`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              {isAdmin && <span className="text-[8px] font-black uppercase text-red-500 tracking-widest mt-1 opacity-80">ADMIN</span>}
            </div>
            
            <button
              onClick={handleLogout}
              className="p-3.5 rounded-2xl bg-[#13151c] text-white/30 border border-white/5 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-all mb-2 shadow-sm"
              title="Cerrar sesión"
            >
              <IconLogout />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-8 sm:p-10 overflow-auto h-screen relative">
        {children}
      </main>
    </div>
  );
}
