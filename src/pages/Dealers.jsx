import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listDealers, toggleDealer } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { timeAgo } from '../utils/format';

/* ── Icons ──────────────────────────────────────────────────────────────── */
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
);

/* ── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, accent }) {
  return (
    <div
      className="glass-card float-in p-5 flex flex-col gap-2"
      style={accent ? { borderColor: `${accent}30` } : {}}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent || 'rgba(255,255,255,0.2)' }} />
      <p className="text-2xl font-bold" style={{ color: accent || 'rgba(255,255,255,1)' }}>{value}</p>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.70)' }}>{label}</p>
    </div>
  );
}

/* ── Table header cell ─────────────────────────────────────────────────── */
function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
      style={{ color: 'rgba(255,255,255,0.65)' }}>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between float-in">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>Dealers</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {dealers.length} dealers registrados
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
        >
          {loading ? <Spinner size="sm" /> : <IconRefresh />}
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total dealers"   value={dealers.length}                 />
        <StatCard label="Activos"         value={activeCount}    accent="#10b981" />
        <StatCard label="Pausados"        value={pausedCount}    accent="#f59e0b" />
        <StatCard label="Mensajes totales" value={totalMessages.toLocaleString()} accent="#e63030" />
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Buscar dealer, grupo o GHL ID…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input-dark w-full sm:w-72 rounded-xl px-4 py-2.5 text-sm"
      />

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
                    <td className="px-4 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.95)' }}>
                      {dealer.dealer_name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {dealer.group_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}>
                        {dealer.ghl_location_id || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={dealer.status} />
                    </td>
                    <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {(dealer.message_count || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {timeAgo(dealer.last_activity)}
                    </td>
                    <td className="px-4 py-3">
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
