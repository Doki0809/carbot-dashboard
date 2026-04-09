import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── SVG Icons ─────────────────────────────────────────────────────────── */
const IconDealers = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconAnalytics = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconChannels = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const IconBot = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/>
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

/* ── Nav config ─────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { to: '/dealers',   label: 'DEALERS', Icon: IconDealers },
  { to: '/analytics', label: 'METRICS', Icon: IconAnalytics },
  { to: '/channels',  label: 'CANALES', Icon: IconChannels },
  { to: '/assistant', label: 'ASISTEN', Icon: IconBot },
];

/* ── Desktop Nav Item ───────────────────────────────────────────────────── */
function NavItem({ link, active }) {
  return (
    <Link
      to={link.to}
      className={`mb-4 w-[72px] h-[72px] flex flex-col items-center justify-center gap-1.5 rounded-[1.25rem] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-xl ${
        active
          ? 'bg-[#ff3b45] text-white shadow-[0_8px_16px_rgba(255,59,69,0.4)]'
          : 'bg-transparent text-white/40 hover:text-white hover:bg-white/10'
      }`}
    >
      <span className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
        <link.Icon size={17} />
      </span>
      <span className="text-[9px] font-[800] uppercase tracking-wider">{link.label}</span>
    </Link>
  );
}

/* ── Mobile Floating Pill Bottom Nav ────────────────────────────────────── */
function MobileNav({ pathname }) {
  return (
    <nav
      className="md:hidden fixed bottom-5 left-1/2 z-50 flex items-center gap-0.5 px-2 py-2"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(14,16,21,0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '2rem',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
      }}
    >
      {NAV_LINKS.map((link) => {
        const active = pathname.startsWith(link.to);
        return (
          <Link
            key={link.to}
            to={link.to}
            className="flex flex-col items-center justify-center gap-1 transition-all duration-300"
            style={{
              width: '62px',
              height: '52px',
              borderRadius: '1.5rem',
              background: active ? '#ff3b45' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.4)',
              boxShadow: active ? '0 6px 20px rgba(255,59,69,0.5)' : 'none',
              transform: active ? 'translateY(-3px) scale(1.05)' : 'none',
            }}
          >
            <link.Icon size={20} />
            <span style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1 }}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ── Main Layout ────────────────────────────────────────────────────────── */
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div
      className="flex min-h-screen bg-[#090a0f] relative text-white"
      style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── Desktop Sidebar (hidden on mobile) ──────────────────────── */}
      <aside className="sticky top-0 h-screen w-[95px] min-w-[95px] hidden md:flex flex-col z-30 overflow-hidden bg-[#0e1015] border-r border-transparent shadow-2xl">
        <div className="relative flex flex-col h-full items-center py-6 gap-2">

          {/* Brand */}
          <Link to="/dealers" className="flex items-center justify-center mb-8 hover:scale-110 transition-transform duration-300">
            <div className="w-[72px] h-[72px] flex items-center justify-center">
              <img src="/3.png" alt="Logo" className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0px 6px 10px rgba(255,0,0,0.5))' }} />
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col items-center w-full overflow-y-auto scrollbar-hide py-1">
            {NAV_LINKS.map((link) => (
              <NavItem key={link.to} link={link} active={location.pathname.startsWith(link.to)} />
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
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=151720&color=ff4d4d&bold=true`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto h-screen relative bg-[#090a0f] px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-10">

        {/* Mobile top bar: logo + logout + avatar */}
        <div className="flex md:hidden items-center justify-between mb-6">
          <Link to="/dealers">
            <img
              src="/3.png"
              alt="Logo"
              className="h-10 w-auto object-contain"
              style={{ filter: 'drop-shadow(0px 4px 8px rgba(255,0,0,0.5))' }}
            />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff4d4d'; e.currentTarget.style.background = 'rgba(255,77,77,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <IconLogout />
            </button>
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=151720&color=ff4d4d&bold=true`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {children}
      </main>

      {/* ── Mobile floating bottom nav ───────────────────────────────── */}
      <MobileNav pathname={location.pathname} />
    </div>
  );
}
