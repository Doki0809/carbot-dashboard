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
  { to: '/dealers',    label: 'Dealers',    Icon: IconDealers },
  { to: '/analytics',  label: 'Analytics',  Icon: IconAnalytics },
  { to: '/channels',   label: 'Canales',    Icon: IconChannels },
  { to: '/apis',       label: 'APIs',       Icon: IconAPIs },
  {
    label: 'Asistente',
    Icon: IconBot,
    prefix: '/assistant',
    children: [
      { to: '/assistant/playground', label: 'Área de prueba',       Icon: IconPlayground },
      { to: '/assistant/skills',    label: 'Skills',              Icon: IconSkills },
      { to: '/assistant/knowledge', label: 'Base de conocimiento', Icon: IconKnowledge },
    ],
  },
];

/* ── Dropdown item ─────────────────────────────────────────────────────── */
function DropdownNav({ link, currentPath, collapsed }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = currentPath.startsWith(link.prefix);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={collapsed ? link.label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
          isActive
            ? 'text-white'
            : 'text-white/45 hover:text-white/75 hover:bg-white/[0.04]'
        }`}
        style={isActive ? {
          background: 'linear-gradient(135deg, rgba(230,48,48,0.25), rgba(180,20,20,0.15))',
          border: '1px solid rgba(230,48,48,0.25)',
          boxShadow: '0 2px 12px rgba(230,48,48,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        } : { border: '1px solid transparent' }}
      >
        <span className={`shrink-0 transition-colors ${isActive ? 'text-brand-400' : 'text-white/35'}`}>
          <link.Icon />
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{link.label}</span>
            <span className={isActive ? 'text-brand-400/70' : 'text-white/25'}>
              <IconChevron open={open} />
            </span>
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className="mt-1 ml-3 space-y-0.5 animate-slide-down">
          {link.children.map((child) => {
            const childActive = currentPath.startsWith(child.to);
            return (
              <Link
                key={child.to}
                to={child.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                  childActive
                    ? 'text-brand-400 font-semibold'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                }`}
                style={childActive ? { background: 'rgba(230,48,48,0.12)', border: '1px solid rgba(230,48,48,0.18)' } : {}}
              >
                <span className={childActive ? 'text-brand-400' : 'text-white/30'}>
                  <child.Icon />
                </span>
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Single nav item ───────────────────────────────────────────────────── */
function NavItem({ link, active, collapsed }) {
  return (
    <Link
      to={link.to}
      title={collapsed ? link.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'text-white'
          : 'text-white/45 hover:text-white/75 hover:bg-white/[0.04]'
      } ${collapsed ? 'justify-center' : ''}`}
      style={active ? {
        background: 'linear-gradient(135deg, rgba(230,48,48,0.25), rgba(180,20,20,0.15))',
        border: '1px solid rgba(230,48,48,0.25)',
        boxShadow: '0 2px 12px rgba(230,48,48,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
      } : { border: '1px solid transparent' }}
    >
      <span className={`shrink-0 transition-colors ${active ? 'text-brand-400' : 'text-white/35'}`}>
        <link.Icon />
      </span>
      {!collapsed && <span className="truncate">{link.label}</span>}
    </Link>
  );
}

/* ── Layout ────────────────────────────────────────────────────────────── */
export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const sidebarWidth = collapsed ? '68px' : '236px';
  const initial = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--bg-base)', backgroundImage: 'var(--bg-mesh)', backgroundAttachment: 'fixed' }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          transition: 'width 280ms cubic-bezier(0.25,0.46,0.45,0.94), min-width 280ms cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
        className="sticky top-0 h-screen flex flex-col z-30 overflow-hidden"
      >
        {/* Glass backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(12, 12, 12, 0.88)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '4px 0 32px rgba(0,0,0,0.5)',
          }}
        />
        {/* Red top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(230,48,48,0.5), transparent)' }}
        />

        <div className="relative flex flex-col h-full p-3 gap-1">
          {/* Brand header */}
          <div className="flex items-center justify-between px-1 py-2 mb-2">
            {!collapsed && (
              <Link to="/dealers" className="flex items-center gap-2.5 group min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ boxShadow: '0 2px 12px rgba(230,48,48,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' }}
                >
                  <img src="/3.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span
                  className="font-bold text-sm tracking-tight truncate"
                  style={{ color: 'rgba(255,255,255,0.90)' }}
                >
                  Carbot
                </span>
              </Link>
            )}
            {collapsed && (
              <Link to="/dealers" className="mx-auto">
                <div
                  className="w-8 h-8 rounded-xl overflow-hidden shrink-0"
                  style={{ boxShadow: '0 2px 12px rgba(230,48,48,0.4)' }}
                >
                  <img src="/3.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
              </Link>
            )}
            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: 'rgba(255,255,255,0.25)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
                title="Colapsar"
              >
                <IconCollapse />
              </button>
            )}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: '#1a1a1a',
                  border: '1px solid rgba(230,48,48,0.3)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  color: 'rgba(255,255,255,0.5)',
                }}
                title="Expandir"
              >
                <IconExpand />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="divider-red mx-1 mb-2" />

          {/* Nav items */}
          <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <DropdownNav
                  key={link.label}
                  link={link}
                  currentPath={location.pathname}
                  collapsed={collapsed}
                />
              ) : (
                <NavItem
                  key={link.to}
                  link={link}
                  active={location.pathname.startsWith(link.to)}
                  collapsed={collapsed}
                />
              )
            )}
          </nav>

          {/* Divider */}
          <div className="divider-red mx-1 mt-2 mb-3" />

          {/* User footer */}
          <div className={`flex items-center gap-2.5 px-1 ${collapsed ? 'justify-center' : ''}`}>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(230,48,48,0.12)',
                border: '1px solid rgba(230,48,48,0.2)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <span className="text-xs font-bold" style={{ color: '#e63030' }}>{initial}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {user?.name || 'Usuario'}
                </p>
                {isAdmin && (
                  <span
                    className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-md leading-none mt-0.5"
                    style={{ background: 'rgba(230,48,48,0.15)', color: '#e63030', border: '1px solid rgba(230,48,48,0.25)' }}
                  >
                    admin
                  </span>
                )}
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg transition-all cursor-pointer"
                style={{ color: 'rgba(255,255,255,0.25)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#e63030'; e.currentTarget.style.background = 'rgba(230,48,48,0.10)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <IconLogout />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="mt-1 mx-auto p-1.5 rounded-lg transition-all cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e63030'; e.currentTarget.style.background = 'rgba(230,48,48,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <IconLogout />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
