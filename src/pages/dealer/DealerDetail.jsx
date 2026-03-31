import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listDealers, toggleDealer, getLogs } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';
import { timeAgo, formatDate } from '../../utils/format';

export default function DealerDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [dealer, setDealer] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [allDealers, logs] = await Promise.all([
        listDealers(),
        getLogs(id, 5, 0),
      ]);
      const found = allDealers.find((d) => d.id === id);
      if (!found) {
        setError('Dealer no encontrado.');
      } else {
        setDealer(found);
        setRecentLogs(logs);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle() {
    const action = dealer.status === 'active' ? 'pause' : 'resume';
    setToggling(true);
    try {
      await toggleDealer(dealer.id, action);
      setDealer((prev) => ({
        ...prev,
        status: action === 'pause' ? 'paused' : 'active',
      }));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={load} />;
  }

  if (!dealer) return null;

  const totalMessages = dealer.message_count || 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 flex items-center gap-1">
        <Link to="/dealers" className="hover:text-slate-800">Dealers</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{dealer.dealer_name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{dealer.dealer_name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registrado {timeAgo(dealer.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={dealer.status} />
          {isAdmin && (
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${
                dealer.status === 'active'
                  ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {toggling ? '...' : dealer.status === 'active' ? '⏸ Pausar' : '▶ Reanudar'}
            </button>
          )}
          <Link
            to={`/dealer/${dealer.id}/logs`}
            className="text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            Ver logs
          </Link>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoCard label="Grupo WhatsApp" value={dealer.group_name} icon="💬" />
        <InfoCard
          label="GHL Location ID"
          value={
            <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
              {dealer.ghl_location_id || '—'}
            </span>
          }
          icon="🔗"
        />
        <InfoCard label="Última actividad" value={timeAgo(dealer.last_activity)} icon="🕐" />
        <InfoCard label="Total mensajes" value={totalMessages.toLocaleString()} icon="📨" />
        <InfoCard label="Registrado" value={formatDate(dealer.created_at)} icon="📅" />
        <InfoCard
          label="Gasto estimado / mes"
          value={dealer.monthly_spend ? `$${parseFloat(dealer.monthly_spend).toFixed(2)}` : '—'}
          icon="💰"
        />
      </div>

      {/* Recent messages */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm">Últimos mensajes</h2>
          <Link
            to={`/dealer/${dealer.id}/logs`}
            className="text-xs text-brand-600 hover:text-brand-800 font-medium"
          >
            Ver todos →
          </Link>
        </div>
        {recentLogs.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-400">Sin mensajes aún.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentLogs.map((log) => (
              <div key={log.id} className="px-5 py-3 text-sm">
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-xs text-slate-400 shrink-0 mt-0.5">{timeAgo(log.timestamp)}</span>
                  {log.escalated && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded shrink-0">
                      escalado
                    </span>
                  )}
                </div>
                <p className="text-slate-700">
                  <span className="font-medium text-slate-900">Usuario: </span>
                  {log.user_message}
                </p>
                <p className="text-slate-500 mt-0.5 line-clamp-2">
                  <span className="font-medium text-slate-700">Missy: </span>
                  {log.bot_response}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-slate-800 font-medium text-sm">{value}</div>
    </div>
  );
}
