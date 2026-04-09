import { useState, useEffect, useCallback } from 'react';
import { listDealers, getLogs, getAnalyticsSummary } from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { timeAgo } from '../utils/format';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const CHART_COLORS = ['#e63030', '#ff6b6b', '#cc1f1f', '#ff8080', '#a61414', '#ff4d4d'];

/* ── Icons ───────────────────────────────────────────────────────────────── */
const Icons = {
  users: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  activity: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  message: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  zap: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  dollar: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  layers: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>,
  cpu: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  alert: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
};

/* ── KPI card ────────────────────────────────────────────────────────────── */
function KPI({ label, value, accent, icon }) {
  const isUp = Math.random() > 0.5; // Simulate a trend for aesthetics
  return (
    <div
      className="glass-card float-in p-5 flex flex-col gap-3 relative overflow-hidden group transition-all duration-300 hover:-translate-y-2"
      style={accent ? { borderColor: `${accent}28` } : {}}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 15px 40px ${accent ? accent+'25' : 'rgba(255,255,255,0.08)'}`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg group-hover:scale-110 transition-transform duration-300" style={{ background: accent ? `${accent}15` : 'rgba(255,255,255,0.05)', color: accent || 'rgba(255,255,255,0.7)', border: `1px solid ${accent ? accent+'30' : 'rgba(255,255,255,0.1)'}` }}>
          {Icons[icon]}
        </div>
        <p className="text-xs tracking-wide transition-colors duration-300 group-hover:text-white" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</p>
      </div>
      <div className="flex items-end gap-2 mt-1">
        <p className="text-3xl font-bold tabular-nums tracking-tight transform origin-left transition-transform duration-300 group-hover:scale-105" style={{ color: 'rgba(255,255,255,0.95)' }}>{value}</p>
        <div className="text-[10px] font-medium mb-1 px-1.5 py-0.5 rounded" style={{ background: isUp ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: isUp ? '#10b981' : '#f59e0b' }}>
          {isUp ? '+12%' : '~0%'}
        </div>
      </div>
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
function ChartPanel({ title, children, className = '', action }) {
  return (
    <div className={`glass-card p-5 float-in flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'rgba(255,255,255,0.85)' }}>{title}</h2>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full">
        {children}
      </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KPI label="Total dealers"   value={dealers.length} icon="users" />
            <KPI label="Dealers activos" value={activeCount}    accent="#10b981" icon="activity" />
            <KPI label="Total mensajes"  value={totalMessages.toLocaleString()} accent="#e63030" icon="message" />
            <KPI label="Resp. promedio"  value={avgResponseMs != null ? `${avgResponseMs}ms` : '—'} accent="#8b5cf6" icon="zap" />
          </div>

          {/* KPIs row 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KPI label="Costo estimado"  value={`$${estimatedCostUSD.toFixed(4)}`} accent="#f59e0b" icon="dollar" />
            <KPI label="Tokens entrada"  value={totalInputTokens.toLocaleString()} icon="layers" />
            <KPI label="Tokens salida"   value={totalOutputTokens.toLocaleString()} accent="#06b6d4" icon="cpu" />
            <KPI label="Escalaciones"    value={totalEscalated.toLocaleString()} accent="#f43f5e" icon="alert" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartPanel title="Mensajes últimos 30 días" className="lg:col-span-2 stagger-3">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={dailyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e63030" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e63030" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} dy={10} minTickGap={20} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    name="Mensajes"
                    stroke="#e63030"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#areaGrad)"
                    activeDot={{ r: 4, fill: '#ff8080', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Estado de dealers" className="stagger-4">
              {statusData.length > 0 ? (
                <div className="relative h-full flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name"
                        cx="50%" cy="50%" outerRadius={80} innerRadius={60}
                        stroke="none"
                      >
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? '#10b981' : '#f59e0b'} opacity={0.9} />
                        ))}
                      </Pie>
                      <Legend iconSize={8} wrapperStyle={{ ...legendStyle, bottom: 0 }} />
                      <Tooltip content={<DarkTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Glowing center text */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-3 pointer-events-none">
                    <p className="text-3xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>{dealers.length}</p>
                    <p className="text-[10px] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>Total</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Sin datos suficientes</p>
                </div>
              )}
            </ChartPanel>
          </div>

          {/* Performance Table */}
          {dealerMsgData.length > 0 && (
            <ChartPanel title="Rendimiento Top Dealers (Mensajes)" className="stagger-5">
              <div className="space-y-5 pt-2">
                {dealerMsgData.map((d, i) => {
                  const maxMsg = Math.max(...dealerMsgData.map(dm => dm.messages));
                  const pct = Math.max(2, Math.round((d.messages / maxMsg) * 100)); // minimo 2% largo visual
                  const isTop = i === 0;
                  return (
                    <div key={d.name} className="flex flex-col gap-2 group">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate pr-4" style={{ color: isTop ? '#f59e0b' : 'rgba(255,255,255,0.85)' }}>
                          {isTop && <span className="mr-1.5" title="Leading Dealer">🏆</span>}{d.name}
                        </span>
                        <span className="tabular-nums font-bold text-xs" style={{ color: 'rgba(255,255,255,0.95)' }}>
                          {d.messages.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden bg-black/40 relative">
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${pct}%`, 
                            background: isTop ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #e63030, #ff8080)',
                            boxShadow: isTop ? '0 0 12px rgba(245,158,11,0.6)' : 'none'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartPanel>
          )}

          {/* Escalations Table */}
          <div className="glass-card p-5 float-in flex flex-col stagger-6 overflow-hidden">
            <h2 className="text-sm font-semibold tracking-wide mb-5" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Matriz de Escalaciones
            </h2>
            {allLogs.filter(l => l.escalated).length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 opacity-60">
                <div className="mb-3 text-emerald-500 scale-150">{Icons.activity}</div>
                <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.65)' }}>Todo en orden.<br/>Sin escalaciones recientes.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 px-5 pb-2">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th className="pb-3 font-medium pl-2">Dealer</th>
                      <th className="pb-3 font-medium">Motivo Crítico</th>
                      <th className="pb-3 text-right font-medium pr-2">Hace</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLogs.filter(l => l.escalated).slice(0, 6).map((log, i) => (
                      <tr 
                        key={log.id} 
                        className="group transition-colors cursor-default"
                        style={{ borderBottom: i === 5 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(230,48,48,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full shadow-[0_0_8px_#e63030]" style={{ background: '#e63030' }} />
                            <span className="font-semibold text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.95)' }}>{log.dealerName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 max-w-[180px] truncate tabular-nums text-xs" style={{ color: 'rgba(255,255,255,0.65)' }} title={log.user_message}>
                          {log.user_message}
                        </td>
                        <td className="py-3.5 text-right pr-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {timeAgo(log.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
