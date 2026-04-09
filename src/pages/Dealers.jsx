import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listDealers, toggleDealer } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { timeAgo } from '../utils/format';

/* ── Icons ──────────────────────────────────────────────────────────────── */
const Icons = {
  refresh: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  box: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  dollar: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  users: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  message: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
};

/* ── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, accent, icon }) {
  return (
    <div
      className="glass-card float-in p-8 flex flex-col gap-6 relative overflow-hidden group transition-all"
    >
      <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-all duration-700" style={{ color: accent || '#fff' }}>
        <div style={{ transform: 'scale(5)' }}>{icon}</div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full shadow-inner" style={{ background: accent ? `${accent}12` : 'rgba(255,255,255,0.05)', color: accent || 'rgba(255,255,255,0.8)' }}>
          {icon}
        </div>
      </div>
      
      <div className="flex flex-col mt-auto relative z-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
        <p className="text-5xl font-black tabular-nums tracking-tighter" style={{ color: 'rgba(255,255,255,0.95)' }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Table header cell ─────────────────────────────────────────────────── */
function Th({ children }) {
  return (
    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-widest whitespace-nowrap"
      style={{ color: 'rgba(255,255,255,0.5)' }}>
      {children}
    </th>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function Dealers() {
  const { isAdmin } = useAuth();
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [toggling, setToggling] = useState(null);
  const [search, setSearch]   = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try   { setDealers(await listDealers()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(dealer) {
    const action = dealer.status === 'active' ? 'pause' : 'resume';
    setToggling(dealer.id);
    try {
      await toggleDealer(dealer.id, action);
      setDealers(prev => prev.map(d =>
        d.id === dealer.id ? { ...d, status: action === 'pause' ? 'paused' : 'active' } : d
      ));
    } catch (err) { alert(`Error: ${err.message}`); }
    finally { setToggling(null); }
  }

  const filtered = dealers.filter(d =>
    d.dealer_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.group_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.ghl_location_id?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount  = dealers.filter(d => d.status === 'active').length;
  const pausedCount  = dealers.filter(d => d.status === 'paused').length;
  const totalMessages = dealers.reduce((s, d) => s + (d.message_count || 0), 0);

  return (
    <div className="space-y-8 pb-10">
      {/* Mega Hero Banner */}
      <div 
        className="w-full rounded-[2rem] p-10 sm:p-14 float-in relative overflow-hidden flex flex-col sm:flex-row shadow-2xl items-center justify-between"
        style={{ 
          background: 'linear-gradient(135deg, #f42c2c 0%, #e61d1d 100%)',
          boxShadow: '0 24px 48px rgba(230,48,48,0.25), inset 0 2px 0 rgba(255,255,255,0.2)'
        }}
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black opacity-[0.08] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 w-full sm:w-2/3">
          <h1 className="text-4xl sm:text-[44px] font-black tracking-tight mb-3 text-white drop-shadow-md leading-tight">
            Bienvenido a CarBot System
          </h1>
          <p className="text-white/90 text-lg sm:text-xl font-medium tracking-wide">
            Panel administrativo. <span className="font-light">Supervisa tu red de dealers con calidad élite.</span>
          </p>
        </div>
        
        <div className="relative z-10 w-full sm:w-1/3 mt-8 sm:mt-0 flex justify-end">
           <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/20 hover:scale-[1.02]"
          >
            {loading ? <Spinner size="sm" /> : Icons.refresh}
            ACTUALIZAR DATOS
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Inventario Dealers" value={dealers.length}                 icon={Icons.users} accent="#3b82f6" />
        <StatCard label="Dealers Activos"    value={activeCount}    accent="#10b981" icon={Icons.dollar} />
        <StatCard label="Dealers Inactivos"  value={pausedCount}    accent="#f59e0b" icon={Icons.box} />
        <StatCard label="Mensajes Emitidos"  value={totalMessages.toLocaleString()} accent="#e63030" icon={Icons.message} />
      </div>

      {/* Search area */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight px-1" style={{ color: 'rgba(255,255,255,0.95)' }}>Registro Global</h2>
        <input
          type="search"
          placeholder="Buscar dealer, grupo o GHL ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-dark w-full sm:w-96 rounded-2xl px-5 py-3.5 text-base shadow-inner"
        />
      </div>

      {error && <ErrorMessage message={error} onRetry={load} />}

      {/* Table */}
      {loading && !dealers.length ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="glass-card overflow-hidden float-in stagger-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <Th>Dealer</Th>
                  <Th>Grupo WhatsApp</Th>
                  <Th>GHL Location ID</Th>
                  <Th>Estado</Th>
                  <Th>Mensajes</Th>
                  <Th>Última actividad</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-sm" style={{ color: 'rgba(255,255,255,0.60)' }}>
                      {search ? 'Sin resultados para esa búsqueda.' : 'No hay dealers registrados.'}
                    </td>
                  </tr>
                )}
                {filtered.map((dealer, i) => (
                  <tr
                    key={dealer.id}
                    className="transition-colors duration-150"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-5 py-4.5 font-medium" style={{ color: 'rgba(255,255,255,0.95)' }}>
                      {dealer.dealer_name}
                    </td>
                    <td className="px-5 py-4.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {dealer.group_name}
                    </td>
                    <td className="px-5 py-4.5">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md border border-white/10"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.85)' }}>
                        {dealer.ghl_location_id || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4.5">
                      <StatusBadge status={dealer.status} />
                    </td>
                    <td className="px-5 py-4.5 font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {(dealer.message_count || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4.5 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {timeAgo(dealer.last_activity)}
                    </td>
                    <td className="px-5 py-4.5">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/dealer/${dealer.id}`}
                          className="text-xs font-medium transition-colors"
                          style={{ color: '#e63030' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ff8080'}
                          onMouseLeave={e => e.currentTarget.style.color = '#e63030'}
                        >
                          Ver
                        </Link>
                        <Link
                          to={`/dealer/${dealer.id}/logs`}
                          className="text-xs font-medium transition-colors"
                          style={{ color: 'rgba(255,255,255,0.65)' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.95)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                        >
                          Logs
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => handleToggle(dealer)}
                            disabled={toggling === dealer.id}
                            className="text-xs font-medium transition-colors disabled:opacity-40"
                            style={{ color: dealer.status === 'active' ? '#f59e0b' : '#10b981' }}
                          >
                            {toggling === dealer.id
                              ? '…'
                              : dealer.status === 'active' ? 'Pausar' : 'Reanudar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
