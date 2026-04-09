import { useState, useEffect, useCallback } from 'react';
import { listChannels, saveChannel, testChannel, disconnectChannel } from '../services/api';

/* ── Channel meta ─────────────────────────────────────────────────────────── */
const CHANNEL_META = {
  telegram: {
    label: 'Telegram',
    description: 'Bot de Telegram conectado al asistente',
    fields: [
      { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: '1234567890:ABCDef…', required: true, hint: 'Obtén el token de @BotFather en Telegram' },
      { key: 'chat_id',   label: 'Chat ID',   type: 'text',     placeholder: '-1001234567890',    required: false, hint: 'ID del grupo o canal (opcional)' },
    ],
    guide: [
      'Abre Telegram y busca @BotFather',
      'Escribe /newbot y sigue las instrucciones',
      'Copia el token que te da BotFather',
      'Pégalo en el campo "Bot Token"',
      'Guarda y prueba la conexión',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
    accent: '#38bdf8',
  },
  discord: {
    label: 'Discord',
    description: 'Bot de Discord para servidores',
    fields: [
      { key: 'bot_token',   label: 'Bot Token',          type: 'password', placeholder: 'MTIzND…',          required: true,  hint: 'Token del bot en Discord Developer Portal' },
      { key: 'guild_id',    label: 'Server ID (Guild)',   type: 'text',     placeholder: '12345678901234…', required: true,  hint: 'Clic derecho en el servidor → Copiar ID' },
      { key: 'channel_id',  label: 'Canal ID',            type: 'text',     placeholder: '12345678901234…', required: true,  hint: 'Clic derecho en el canal → Copiar ID' },
      { key: 'webhook_url', label: 'Webhook URL',         type: 'text',     placeholder: 'https://discord…',required: false, hint: 'Para notificaciones salientes (opcional)' },
    ],
    guide: [
      'Ve a discord.com/developers/applications',
      'Crea una nueva aplicación y agrega un Bot',
      'Copia el token del bot',
      'Activa "Developer Mode" en Discord (Ajustes → Avanzado)',
      'Clic derecho en el servidor → "Copy Server ID"',
      'Clic derecho en el canal → "Copy Channel ID"',
      'Pega los datos y guarda',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    accent: '#818cf8',
  },
  whatsapp: {
    label: 'WhatsApp',
    description: 'Canal de WhatsApp Business API',
    fields: [
      { key: 'phone_number',        label: 'Número de teléfono',  type: 'text',     placeholder: '18095551234',       required: true,  hint: 'Sin + ni espacios' },
      { key: 'business_account_id', label: 'Business Account ID', type: 'text',     placeholder: '123456789012345',   required: true,  hint: 'ID de tu cuenta en Meta for Developers' },
      { key: 'access_token',        label: 'Access Token',        type: 'password', placeholder: 'EAABwz…',           required: true,  hint: 'Token permanente de Meta for Developers' },
    ],
    guide: [
      'Ve a developers.facebook.com y crea una app',
      'Agrega el producto "WhatsApp"',
      'Copia el Business Account ID',
      'Crea un System User con token permanente',
      'Agrega el número de WhatsApp Business',
      'Pega los datos y guarda',
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
      </svg>
    ),
    accent: '#34d399',
  },
};

/* ── Eye icon ─────────────────────────────────────────────────────────────── */
const IconEye = ({ show }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {show
      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    }
  </svg>
);

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
);

const IconChevron = ({ open }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms ease' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* ── Status badge ─────────────────────────────────────────────────────────── */
function ChannelStatus({ status }) {
  const cfg = {
    connected:    { label: 'Conectado',    dot: '#10b981', glow: 'rgba(16,185,129,0.5)',  bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.25)', color: '#34d399', pulse: true },
    disconnected: { label: 'Desconectado', dot: 'rgba(255,255,255,0.25)', glow: 'none', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.40)', pulse: false },
    error:        { label: 'Error',        dot: '#e63030', glow: 'rgba(230,48,48,0.5)',   bg: 'rgba(230,48,48,0.08)',   border: 'rgba(230,48,48,0.25)', color: '#ff8080',  pulse: false },
  }[status] ?? { label: 'Desconectado', dot: 'rgba(255,255,255,0.25)', glow: 'none', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.40)', pulse: false };

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.pulse ? 'animate-pulse' : ''}`}
        style={{ background: cfg.dot, boxShadow: cfg.pulse ? `0 0 4px ${cfg.glow}` : 'none' }} />
      {cfg.label}
    </span>
  );
}

/* ── Channel card (summary) ───────────────────────────────────────────────── */
function ChannelCard({ type, channel, onSelect, selected }) {
  const meta     = CHANNEL_META[type];
  const status   = channel?.status ?? 'disconnected';
  const isSelected = selected === type;

  return (
    <button
      onClick={() => onSelect(isSelected ? null : type)}
      className="w-full text-left p-6 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] group relative overflow-hidden"
      style={{
        background: '#0e1015', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.03)',
        ...(isSelected ? {
          borderColor: `${meta.accent}35`,
          boxShadow: `0 0 0 1px ${meta.accent}25, 0 20px 40px rgba(0,0,0,0.5)`,
        } : {})
      }}
    >
      {/* 3D Radial Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
           style={{ background: `radial-gradient(circle at 10% 50%, ${meta.accent}15 0%, transparent 60%)` }} />
           
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none" 
             style={{ background: `radial-gradient(circle at 10% 50%, ${meta.accent}10 0%, transparent 80%)` }} />
      )}

      {/* Watermark SVG */}
      <div className="absolute -bottom-8 -right-8 pointer-events-none opacity-5 group-hover:opacity-20 group-hover:rotate-12 group-hover:scale-125 transition-all duration-1000 ease-out" style={{ color: meta.accent }}>
        <div style={{ transform: 'scale(4)' }}>{meta.icon}</div>
      </div>

      <div className="flex items-center gap-5 relative z-10">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:-translate-y-1"
             style={{ background: 'rgba(255,255,255,0.05)', color: meta.accent, border: '1px solid rgba(255,255,255,0.08)', boxShadow: `0 10px 30px -10px ${meta.accent}40` }}>
          <div className="w-7 h-7">{meta.icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-bold text-xl truncate transition-colors duration-300 group-hover:text-white" style={{ color: 'rgba(255,255,255,0.85)' }}>{meta.label}</span>
            <ChannelStatus status={status} />
          </div>
          <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>{meta.description}</p>
        </div>
      </div>
    </button>
  );
}

/* ── Channel form ─────────────────────────────────────────────────────────── */
function ChannelForm({ type, channel, onDone }) {
  const meta = CHANNEL_META[type];
  const [form,         setForm]         = useState({});
  const [showSecrets,  setShowSecrets]  = useState({});
  const [saving,       setSaving]       = useState(false);
  const [testing,      setTesting]      = useState(false);
  const [disconnecting,setDisconnecting]= useState(false);
  const [testResult,   setTestResult]   = useState(null);
  const [error,        setError]        = useState('');

  useEffect(() => {
    if (!channel) return;
    const initial = {};
    meta.fields.forEach(f => {
      const secretKeys = ['bot_token', 'access_token'];
      if (!secretKeys.includes(f.key)) initial[f.key] = channel[f.key] ?? '';
    });
    setForm(initial);
  }, [channel, meta.fields]);

  const status      = channel?.status ?? 'disconnected';
  const isConnected = status === 'connected';
  const canSave     = () => meta.fields.filter(f => f.required).every(f => (form[f.key] ?? '').toString().trim());

  async function handleSave() {
    setSaving(true); setError(''); setTestResult(null);
    try { await saveChannel(type, { ...form }); onDone(); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleTest() {
    setTesting(true); setTestResult(null); setError('');
    try {
      const result = await testChannel(type);
      setTestResult(result);
      if (result.success) onDone();
    } catch (err) { setTestResult({ success: false, message: err.message }); }
    finally { setTesting(false); }
  }

  async function handleDisconnect() {
    if (!window.confirm(`¿Desconectar ${meta.label}? Se borrarán los tokens guardados.`)) return;
    setDisconnecting(true);
    try { await disconnectChannel(type); setForm({}); onDone(); }
    catch (err) { setError(err.message); }
    finally { setDisconnecting(false); }
  }

  return (
    <div className="mt-2 p-5 space-y-5 animate-slide-down" style={{ background: '#0e1015', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.03)' }}>
      {/* Status banner */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
        style={isConnected
          ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)' }
          : status === 'error'
          ? { background: 'rgba(230,48,48,0.08)',  border: '1px solid rgba(230,48,48,0.20)' }
          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'animate-pulse' : ''}`}
          style={{ background: isConnected ? '#10b981' : status === 'error' ? '#e63030' : 'rgba(255,255,255,0.25)',
            boxShadow: isConnected ? '0 0 4px rgba(16,185,129,0.6)' : 'none' }} />
        <div className="flex-1">
          {isConnected ? (
            <span style={{ color: '#34d399' }}>
              Bot conectado
              {channel?.bot_username && <span style={{ color: 'rgba(52,211,153,0.7)' }}> (@{channel.bot_username})</span>}
              {channel?.phone_number  && <span style={{ color: 'rgba(52,211,153,0.7)' }}> (+{channel.phone_number})</span>}
            </span>
          ) : status === 'error' ? (
            <span style={{ color: '#ff8080' }}>Error de conexión — revisa las credenciales</span>
          ) : (
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>No conectado — configura las credenciales abajo</span>
          )}
        </div>
        {isConnected && (
          <button onClick={handleDisconnect} disabled={disconnecting}
            className="text-xs font-medium rounded-lg px-3 py-1.5 transition-all disabled:opacity-50"
            style={{ color: '#ff8080', border: '1px solid rgba(230,48,48,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(230,48,48,0.10)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {disconnecting ? 'Desconectando…' : 'Desconectar'}
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        {meta.fields.map(field => {
          const isSecret = field.type === 'password';
          const visible  = showSecrets[field.key];
          return (
            <div key={field.key} className={field.key === 'bot_token' || field.key === 'access_token' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold mb-1.5"
                style={{ color: 'rgba(255,255,255,0.45)' }}>
                {field.label}
                {field.required && <span style={{ color: '#e63030' }}> *</span>}
              </label>
              <div className="relative">
                <input
                  type={isSecret && !visible ? 'password' : 'text'}
                  value={form[field.key] ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className={`input-dark w-full rounded-xl px-3 py-2.5 text-sm ${isSecret ? 'pr-10' : ''}`}
                />
                {isSecret && (
                  <button type="button"
                    onClick={() => setShowSecrets(p => ({ ...p, [field.key]: !p[field.key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.30)' }}>
                    <IconEye show={visible} />
                  </button>
                )}
              </div>
              {field.hint && <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{field.hint}</p>}
            </div>
          );
        })}
      </div>

      {/* Test result */}
      {testResult && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={testResult.success
            ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)', color: '#34d399' }
            : { background: 'rgba(230,48,48,0.08)',  border: '1px solid rgba(230,48,48,0.20)',  color: '#ff8080' }}>
          <div className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: testResult.success ? '#10b981' : '#e63030' }} />
          {testResult.message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(230,48,48,0.08)', border: '1px solid rgba(230,48,48,0.20)', color: '#ff8080' }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button onClick={handleSave} disabled={saving || !canSave()}
          className="btn-red flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold">
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button onClick={handleTest} disabled={testing || !canSave()}
          className="btn-ghost flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium">
          {testing ? 'Probando…' : 'Probar conexión'}
        </button>
      </div>

      {/* Guide */}
      <details className="group">
        <summary className="cursor-pointer text-xs font-semibold select-none transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          Cómo conectar {meta.label}
        </summary>
        <ol className="mt-3 space-y-2">
          {meta.guide.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: 'rgba(230,48,48,0.12)', border: '1px solid rgba(230,48,48,0.20)', color: '#e63030' }}>
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function Channels() {
  const [channels, setChannels] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try   { setChannels(await listChannels()); }
    catch (err) { setError(err.message); setChannels([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getChannel   = (type) => channels.find(c => c.type === type) ?? null;
  const connectedCount = channels.filter(c => c.status === 'connected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between float-in">
        <div>
          <h1 className="text-3xl font-[900] tracking-tighter" style={{ color: 'rgba(255,255,255,0.95)' }}>Canales de Atención</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Conecta el bot a otras plataformas</p>
        </div>
        <button onClick={load} disabled={loading} className="btn-ghost flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium">
          <IconRefresh />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 float-in stagger-1">
        {[
          { label: 'Canales disponibles', value: 3,                              accent: '#3b82f6', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
          { label: 'Conectados',          value: loading ? '—' : connectedCount, accent: '#10b981', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: 'Desconectados',       value: loading ? '—' : 3 - connectedCount, accent: '#f59e0b', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
        ].map(({ label, value, accent, icon }) => (
          <div 
            key={label}
            className="group relative flex flex-col p-6 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] cursor-default"
            style={{ background: '#0e1015', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.03)' }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
                 style={{ background: `radial-gradient(circle at 50% 0%, ${accent}25 0%, transparent 70%)` }} />
            
            <div className="absolute -bottom-6 -right-6 pointer-events-none opacity-10 group-hover:opacity-20 group-hover:rotate-12 group-hover:scale-125 transition-all duration-1000 ease-out" style={{ color: accent }}>
              <div style={{ transform: 'scale(5)' }}>{icon}</div>
            </div>

            <div className="flex items-center gap-4 relative z-10 mb-4">
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1 group-hover:rotate-3" 
                    style={{ background: '#151720', border: '1px solid rgba(255,255,255,0.05)', color: accent, boxShadow: `0 10px 30px -10px ${accent}40` }}>
                  <div className="w-6 h-6">{icon}</div>
               </div>
               <p className="text-[11px] font-black uppercase tracking-widest text-white/50">{label}</p>
            </div>
            
            <p className="text-4xl font-[900] tracking-tighter text-white leading-none relative z-10 transition-transform duration-300 group-hover:scale-105 origin-left">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(230,48,48,0.08)', border: '1px solid rgba(230,48,48,0.20)', color: '#ff8080' }}>
          {error}
        </div>
      )}

      {/* Channel list */}
      {loading ? (
        <div className="flex items-center justify-center py-14" style={{ background: '#0e1015', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.03)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>Cargando canales…</p>
        </div>
      ) : (
        <div className="space-y-2 float-in stagger-2">
          {(['telegram', 'discord', 'whatsapp']).map(type => (
            <div key={type}>
              <ChannelCard type={type} channel={getChannel(type)} selected={selected} onSelect={setSelected} />
              {selected === type && (
                <ChannelForm type={type} channel={getChannel(type)} onDone={() => { load(); }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
