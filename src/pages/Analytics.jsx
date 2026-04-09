import { useState, useEffect, useCallback } from 'react';
import { listDealers, getLogs, getAnalyticsSummary } from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { timeAgo } from '../utils/format';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const CHART_COLORS = ['#e63030', '#ff6b6b', '#cc1f1f', '#ff8080', '#a61414', '#ff4d4d'];

/* ── KPI card ────────────────────────────────────────────────────────────── */
function KPI({ label, value, accent }) {
  return (
    <div
      className="glass-card float-in p-5 flex flex-col gap-2"
      style={accent ? { borderColor: `${accent}28` } : {}}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent || 'rgba(255,255,255,0.2)' }} />
      <p className="text-2xl font-bold tabular-nums" style={{ color: accent || 'rgba(255,255,255,0.95)' }}>{value}</p>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.70)' }}>{label}</p>
    </div>
  );
}

/* ── Custom dark tooltip ─────────────────────────────────────────────────── */
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(18,18,18,0.95)',
      border: '1px solid rgba(230,48,48,0.25)',
      borderRadius: 10,
      padding: '8px 12px',
      fontSize: 12,
      color: 'rgba(255,255,255,0.95)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      {label && <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 4, fontSize: 11 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#e63030' }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
}

/* ── Chart panel ─────────────────────────────────────────────────────────── */
function ChartPanel({ title, children, className = '' }) {
  return (
    <div className={`glass-card p-5 float-in ${className}`}>
      <h2 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.85)' }}>{title}</h2>
      {children}
    </div>
  );
}

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
);

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function Analytics() {
  const [dealers,  setDealers]  = useState([]);
  const [allLogs,  setAllLogs]  = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [dealerList, summaryData] = await Promise.all([listDealers(), getAnalyticsSummary()]);
      setDealers(dealerList);
      setSummary(summaryData);

      const top5 = dealerList.slice(0, 5);
      const logResults = await Promise.allSettled(top5.map(d => getLogs(d.id, 100, 0)));
      const combined = [];
      logResults.forEach((r, i) => {
        if (r.status === 'fulfilled')
          r.value.forEach(log => combined.push({ ...log, dealerName: top5[i].dealer_name }));
      });
      setAllLogs(combined);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeCount      = dealers.filter(d => d.status === 'active').length;
  const pausedCount      = dealers.filter(d => d.status === 'paused').length;
  const totalMessages    = summary?.totalMessages ?? dealers.reduce((s, d) => s + (d.message_count || 0), 0);
  const totalEscalated   = summary?.totalEscalated ?? allLogs.filter(l => l.escalated).length;
  const avgResponseMs    = summary?.avgResponseMs ?? null;
  const estimatedCostUSD = summary?.estimatedCostUSD ?? 0;
  const totalInputTokens  = summary?.totalInputTokens ?? 0;
  const totalOutputTokens = summary?.totalOutputTokens ?? 0;

  // Messages per day (last 30)
  const last30 = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'));
  const msgByDay = Object.fromEntries(last30.map(d => [d, 0]));
  if (summary?.messagesByDay) {
    Object.entries(summary.messagesByDay).forEach(([day, count]) => {
      if (msgByDay[day] !== undefined) msgByDay[day] = count;
    });
  } else {
    allLogs.forEach(log => {
      if (!log.timestamp) return;
      const day = log.timestamp.slice(0, 10);
      if (msgByDay[day] !== undefined) msgByDay[day]++;
    });
  }
  const dailyData = last30.map(d => ({
    date: format(parseISO(d), 'dd MMM', { locale: es }),
    messages: msgByDay[d],
  }));

  const dealerMsgData = dealers
    .filter(d => d.message_count > 0)
    .sort((a, b) => b.message_count - a.message_count)
    .slice(0, 8)
    .map(d => ({
      name: d.dealer_name.length > 16 ? d.dealer_name.slice(0, 16) + '…' : d.dealer_name,
      messages: d.message_count || 0,
    }));

  const statusData = [
    { name: 'Activos', value: activeCount },
    { name: 'Pausados', value: pausedCount },
  ].filter(d => d.value > 0);

  const axisStyle  = { fontSize: 11, fill: 'rgba(255,255,255,0.65)' };
  const legendStyle = { fontSize: 12, color: 'rgba(255,255,255,0.75)' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between float-in">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Vista general del sistema</p>
        </div>
        <button onClick={load} disabled={loading} className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
          {loading ? <Spinner size="sm" /> : <IconRefresh />}
          Actualizar
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={load} />}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* KPIs row 1 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPI label="Total dealers"   value={dealers.length} />
            <KPI label="Dealers activos" value={activeCount}    accent="#10b981" />
            <KPI label="Total mensajes"  value={totalMessages.toLocaleString()} accent="#e63030" />
            <KPI label="Resp. promedio"  value={avgResponseMs != null ? `${avgResponseMs}ms` : '—'} accent="#8b5cf6" />
          </div>

          {/* KPIs row 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPI label="Costo estimado"  value={`$${estimatedCostUSD.toFixed(4)}`} accent="#f59e0b" />
            <KPI label="Tokens entrada"  value={totalInputTokens.toLocaleString()} />
            <KPI label="Tokens salida"   value={totalOutputTokens.toLocaleString()} accent="#06b6d4" />
            <KPI label="Escalaciones"    value={totalEscalated.toLocaleString()} accent="#e63030" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartPanel title="Mensajes últimos 30 días" className="lg:col-span-2 stagger-3">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyData} barSize={10}>
                  <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="messages" name="Mensajes" radius={[4, 4, 0, 0]}
                    fill="url(#barGrad)"
                  />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e63030" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#e63030" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Estado de dealers" className="stagger-4">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={68} innerRadius={30}
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                      style={{ fontSize: 11, fill: 'rgba(255,255,255,0.85)' }}
                    >
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#10b981' : '#f59e0b'} opacity={0.85} />
                      ))}
                    </Pie>
                    <Legend iconSize={8} wrapperStyle={legendStyle} />
                    <Tooltip content={<DarkTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-center mt-8" style={{ color: 'rgba(255,255,255,0.65)' }}>Sin datos</p>
              )}
            </ChartPanel>
          </div>

          {/* Messages per dealer */}
          {dealerMsgData.length > 0 && (
            <ChartPanel title="Mensajes por dealer (top 8)" className="stagger-5">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dealerMsgData} layout="vertical" barSize={12}>
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.75)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="messages" name="Mensajes" radius={[0, 4, 4, 0]}>
                    {dealerMsgData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          )}

          {/* Escalations */}
          <div className="glass-card p-5 float-in stagger-6">
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Escalaciones recientes
            </h2>
            {allLogs.filter(l => l.escalated).length === 0 ? (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Sin escalaciones en el período analizado.
              </p>
            ) : (
              <div className="space-y-2">
                {allLogs.filter(l => l.escalated).slice(0, 5).map(log => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
                    style={{ background: 'rgba(230,48,48,0.07)', border: '1px solid rgba(230,48,48,0.18)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#e63030' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs mb-0.5" style={{ color: '#e63030' }}>{log.dealerName}</p>
                      <p className="line-clamp-2" style={{ color: 'rgba(255,255,255,0.85)' }}>{log.user_message}</p>
                    </div>
                    <span className="text-xs shrink-0 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.55)' }}>
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
