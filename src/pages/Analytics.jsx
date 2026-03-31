import { useState, useEffect, useCallback } from 'react';
import { listDealers, getLogs } from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { timeAgo } from '../utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Analytics() {
  const [dealers, setDealers] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const dealerList = await listDealers();
      setDealers(dealerList);

      // Fetch last 100 logs from each dealer (up to 5 dealers to avoid hammering)
      const top5 = dealerList.slice(0, 5);
      const logResults = await Promise.allSettled(
        top5.map((d) => getLogs(d.id, 100, 0))
      );
      const combined = [];
      logResults.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          r.value.forEach((log) => combined.push({ ...log, dealerName: top5[i].dealer_name }));
        }
      });
      setAllLogs(combined);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Derived analytics ──────────────────────────────────────────────────────

  const activeCount = dealers.filter((d) => d.status === 'active').length;
  const pausedCount = dealers.filter((d) => d.status === 'paused').length;
  const totalMessages = dealers.reduce((s, d) => s + (d.message_count || 0), 0);
  const totalEscalated = allLogs.filter((l) => l.escalated).length;

  // Messages per day (last 14 days from combined logs)
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    return format(d, 'yyyy-MM-dd');
  });
  const msgByDay = {};
  last14.forEach((d) => { msgByDay[d] = 0; });
  allLogs.forEach((log) => {
    if (!log.timestamp) return;
    const day = log.timestamp.slice(0, 10);
    if (msgByDay[day] !== undefined) msgByDay[day]++;
  });
  const dailyData = last14.map((d) => ({
    date: format(parseISO(d), 'dd MMM', { locale: es }),
    messages: msgByDay[d],
  }));

  // Messages per dealer
  const dealerMsgData = dealers
    .filter((d) => d.message_count > 0)
    .sort((a, b) => b.message_count - a.message_count)
    .slice(0, 8)
    .map((d) => ({
      name: d.dealer_name.length > 16 ? d.dealer_name.slice(0, 16) + '…' : d.dealer_name,
      messages: d.message_count || 0,
    }));

  // Status pie
  const statusData = [
    { name: 'Activos', value: activeCount },
    { name: 'Pausados', value: pausedCount },
  ].filter((d) => d.value > 0);

  // Average response time
  const logsWithTime = allLogs.filter((l) => l.response_time_ms != null);
  const avgResponseMs =
    logsWithTime.length > 0
      ? Math.round(logsWithTime.reduce((s, l) => s + l.response_time_ms, 0) / logsWithTime.length)
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Vista general del sistema</p>
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

      {error && <ErrorMessage message={error} onRetry={load} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPI label="Total dealers" value={dealers.length} icon="🏢" />
            <KPI label="Dealers activos" value={activeCount} icon="✅" color="emerald" />
            <KPI
              label="Total mensajes"
              value={totalMessages.toLocaleString()}
              icon="💬"
              color="blue"
            />
            <KPI
              label="Resp. promedio"
              value={avgResponseMs != null ? `${avgResponseMs}ms` : '—'}
              icon="⚡"
              color="purple"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Daily messages */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Mensajes últimos 14 días</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyData} barSize={14}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="messages" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Mensajes" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status pie */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Estado de dealers</h2>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#10b981' : '#f59e0b'} />
                      ))}
                    </Pie>
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-400 text-center mt-8">Sin datos</p>
              )}
            </div>
          </div>

          {/* Messages per dealer */}
          {dealerMsgData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">
                Mensajes por dealer (top 8)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dealerMsgData} layout="vertical" barSize={14}>
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="messages" name="Mensajes" radius={[0, 4, 4, 0]}>
                    {dealerMsgData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Escalations */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Escalaciones recientes</h2>
            {allLogs.filter((l) => l.escalated).length === 0 ? (
              <p className="text-sm text-slate-400">Sin escalaciones en el período analizado.</p>
            ) : (
              <div className="space-y-3">
                {allLogs
                  .filter((l) => l.escalated)
                  .slice(0, 5)
                  .map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 bg-red-50 rounded-lg px-4 py-3 text-sm"
                    >
                      <span className="text-base shrink-0">⚠️</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-red-700 text-xs mb-0.5">{log.dealerName}</p>
                        <p className="text-slate-700 line-clamp-2">{log.user_message}</p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                        {timeAgo(log.timestamp)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function KPI({ label, value, icon, color }) {
  const ring =
    color === 'emerald'
      ? 'ring-emerald-100'
      : color === 'blue'
      ? 'ring-blue-100'
      : color === 'purple'
      ? 'ring-purple-100'
      : 'ring-slate-100';
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 ring-1 ${ring} shadow-sm`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span>{icon}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
