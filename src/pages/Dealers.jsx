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
      className="glass-card float-in flex flex-col relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] cursor-pointer" 
      style={{ background: '#13151c', padding: 'clamp(1rem, 4vw, 1.5rem)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
        style={{ background: `radial-gradient(circle at 60% 0%, ${accent || '#fff'}15 0%, transparent 60%)` }}
      />

      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
           style={{ background: '#1c1f2b', border: '1px solid rgba(255,255,255,0.05)', color: accent || 'rgba(255,255,255,0.8)' }}>
        {icon}
      </div>
      
      <div className="flex flex-col mt-4 relative z-10">
        <p className="text-[9px] sm:text-[10px] font-[800] uppercase tracking-widest mb-1 transition-colors duration-300 group-hover:text-white/80" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
        <p className="text-3xl sm:text-[44px] font-[900] tabular-nums tracking-tighter leading-none transition-transform duration-300 origin-left group-hover:scale-[1.03]" style={{ color: 'rgba(255,255,255,0.95)' }}>{value}</p>
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
        className="w-full float-in relative overflow-hidden py-10 px-10 sm:px-12 mb-8 flex flex-col sm:flex-row items-center justify-between group transition-all duration-700 hover:shadow-[0_30px_60px_rgba(255,59,69,0.3)] hover:-translate-y-1"
        style={{ 
          background: 'linear-gradient(90deg, #ff3b45 0%, #ff1a2b 100%)',
          borderRadius: '2.5rem',
          boxShadow: '0 20px 40px rgba(255,59,69,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
        }}
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black opacity-[0.06] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
        
        <div className="relative z-10 w-full sm:w-2/3">
          <h1 className="text-2xl sm:text-[44px] font-[900] tracking-tighter text-white leading-[1.05] whitespace-nowrap overflow-hidden text-ellipsis">
            Bienvenido al mundo de Missy
          </h1>
          <p className="text-white/80 text-[13px] sm:text-[15px] font-[400] tracking-wide mt-2">
            Panel administrativo listo para supervisar a Missy.
          </p>
        </div>
        
        <div className="relative z-10 w-full sm:w-1/3 mt-6 sm:mt-0 flex justify-end gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[12px] font-bold uppercase tracking-wider text-white transition-all shadow-[0_8px_20px_rgba(255,0,0,0.3)] hover:scale-105"
            style={{ background: '#ff4d4d', border: 'none' }}
          >
            {loading ? <Spinner size="sm" /> : Icons.refresh}
            ACTUALIZAR DATOS
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard label="INVENTARIO DEALERS" value={dealers.length}                 icon={Icons.users} accent="#4287f5" />
        <StatCard label="DEALERS ACTIVOS"    value={activeCount}    accent="#22c55e" icon={Icons.dollar} />
        <StatCard label="DEALERS INACTIVOS"  value={pausedCount}    accent="#f59e0b" icon={Icons.box} />
        <StatCard label="MENSAJES EMITIDOS"  value={totalMessages.toLocaleString()} accent="#e63030" icon={Icons.message} />
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
