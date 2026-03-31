import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listDealers, getLogs } from '../../services/api';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate, formatPhone } from '../../utils/format';

const PAGE_SIZE = 50;

export default function DealerLogs() {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEscalated, setFilterEscalated] = useState(false);

  const load = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    try {
      const [allDealers, newLogs] = await Promise.all([
        reset || !dealer ? listDealers() : Promise.resolve(null),
        getLogs(id, PAGE_SIZE, currentOffset),
      ]);
      if (allDealers) {
        const found = allDealers.find((d) => d.id === id);
        setDealer(found || null);
      }
      if (reset) {
        setLogs(newLogs);
        setOffset(PAGE_SIZE);
      } else {
        setLogs((prev) => [...prev, ...newLogs]);
        setOffset((prev) => prev + PAGE_SIZE);
      }
      setHasMore(newLogs.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, offset]);

  useEffect(() => {
    load(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const displayed = logs.filter((log) => {
    if (filterEscalated && !log.escalated) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.user_message?.toLowerCase().includes(q) ||
        log.bot_response?.toLowerCase().includes(q) ||
        log.from_number?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const escalatedCount = logs.filter((l) => l.escalated).length;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 flex items-center gap-1">
        <Link to="/dealers" className="hover:text-slate-800">Dealers</Link>
        <span>/</span>
        {dealer ? (
          <Link to={`/dealer/${id}`} className="hover:text-slate-800">{dealer.dealer_name}</Link>
        ) : (
          <span>Dealer</span>
        )}
        <span>/</span>
        <span className="text-slate-800 font-medium">Logs</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Logs {dealer ? `— ${dealer.dealer_name}` : ''}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {logs.length} mensajes cargados · {escalatedCount} escalados
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition"
        >
          {loading ? <Spinner size="sm" /> : '↻'}
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="search"
          placeholder="Buscar en mensajes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterEscalated}
            onChange={(e) => setFilterEscalated(e.target.checked)}
            className="rounded text-brand-600"
          />
          Solo escalados
        </label>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => load(true)} />}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <Th>Fecha / Hora</Th>
                  <Th>Número</Th>
                  <Th>Mensaje del usuario</Th>
                  <Th>Respuesta Missy</Th>
                  <Th>Estado</Th>
                  <Th>Resp. (ms)</Th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      {search || filterEscalated
                        ? 'Sin resultados para los filtros aplicados.'
                        : 'Sin logs aún.'}
                    </td>
                  </tr>
                )}
                {displayed.map((log) => (
                  <tr
                    key={log.id}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition ${
                      log.escalated ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {formatPhone(log.from_number)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs">
                      <p className="line-clamp-3">{log.user_message}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs">
                      <p className="line-clamp-3">{log.bot_response}</p>
                    </td>
                    <td className="px-4 py-3">
                      {log.escalated ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          ⚠ Escalado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          ✓ OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {log.response_time_ms != null ? `${log.response_time_ms}ms` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Load more */}
          {hasMore && !search && !filterEscalated && (
            <div className="border-t border-slate-100 px-4 py-3 flex justify-center">
              <button
                onClick={() => load(false)}
                disabled={loadingMore}
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 transition disabled:opacity-50"
              >
                {loadingMore ? <Spinner size="sm" /> : null}
                Cargar más
              </button>
            </div>
          )}
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
