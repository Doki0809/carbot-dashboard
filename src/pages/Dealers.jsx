import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listDealers, toggleDealer } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { timeAgo } from '../utils/format';

export default function Dealers() {
  const { isAdmin } = useAuth();
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(null); // dealerId being toggled
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listDealers();
      setDealers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(dealer) {
    const action = dealer.status === 'active' ? 'pause' : 'resume';
    setToggling(dealer.id);
    try {
      await toggleDealer(dealer.id, action);
      setDealers((prev) =>
        prev.map((d) =>
          d.id === dealer.id ? { ...d, status: action === 'pause' ? 'paused' : 'active' } : d
        )
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setToggling(null);
    }
  }

  const filtered = dealers.filter(
    (d) =>
      d.dealer_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.group_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.ghl_location_id?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = dealers.filter((d) => d.status === 'active').length;
  const pausedCount = dealers.filter((d) => d.status === 'paused').length;
  const totalMessages = dealers.reduce((sum, d) => sum + (d.message_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dealers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {dealers.length} dealers registrados
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition"
        >
          {loading ? <Spinner size="sm" /> : '↻'}
          Actualizar
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total dealers" value={dealers.length} icon="🏢" />
        <StatCard label="Activos" value={activeCount} icon="✅" color="emerald" />
        <StatCard label="Pausados" value={pausedCount} icon="⏸️" color="amber" />
        <StatCard label="Mensajes totales" value={totalMessages.toLocaleString()} icon="💬" />
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Buscar dealer, grupo o GHL ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-72 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />

      {/* Error */}
      {error && <ErrorMessage message={error} onRetry={load} />}

      {/* Table */}
      {loading && !dealers.length ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
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
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      {search ? 'Sin resultados para esa búsqueda.' : 'No hay dealers registrados.'}
                    </td>
                  </tr>
                )}
                {filtered.map((dealer) => (
                  <tr key={dealer.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {dealer.dealer_name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{dealer.group_name}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {dealer.ghl_location_id || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={dealer.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {(dealer.message_count || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {timeAgo(dealer.last_activity)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dealer/${dealer.id}`}
                          className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                        >
                          Ver
                        </Link>
                        <Link
                          to={`/dealer/${dealer.id}/logs`}
                          className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                        >
                          Logs
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => handleToggle(dealer)}
                            disabled={toggling === dealer.id}
                            className={`text-xs font-medium transition ${
                              dealer.status === 'active'
                                ? 'text-amber-600 hover:text-amber-800'
                                : 'text-emerald-600 hover:text-emerald-800'
                            } disabled:opacity-50`}
                          >
                            {toggling === dealer.id
                              ? '...'
                              : dealer.status === 'active'
                              ? 'Pausar'
                              : 'Reanudar'}
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

function Th({ children }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  );
}

function StatCard({ label, value, icon, color }) {
  const ring =
    color === 'emerald'
      ? 'ring-emerald-100'
      : color === 'amber'
      ? 'ring-amber-100'
      : 'ring-slate-100';
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 ring-1 ${ring}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-base">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
