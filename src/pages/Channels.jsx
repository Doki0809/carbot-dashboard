import { useState, useEffect, useCallback } from 'react';
import { listChannels, getChannel, saveChannel, testChannel, disconnectChannel } from '../services/api';

// ─── Channel meta ─────────────────────────────────────────────────────────────

const CHANNEL_META = {
  telegram: {
    label: 'Telegram',
    icon: '✈️',
    color: 'blue',
    description: 'Bot de Telegram conectado al asistente',
    fields: [
      { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: '1234567890:ABCDef...', required: true, hint: 'Obtén el token de @BotFather en Telegram' },
      { key: 'chat_id', label: 'Chat ID', type: 'text', placeholder: '-1001234567890', required: false, hint: 'ID del grupo o canal (opcional)' },
    ],
    guide: [
      'Abre Telegram y busca @BotFather',
      'Escribe /newbot y sigue las instrucciones',
      'Copia el token que te da BotFather',
      'Pégalo en el campo "Bot Token"',
      'Guarda y prueba la conexión',
    ],
  },
  discord: {
    label: 'Discord',
    icon: '💬',
    color: 'indigo',
    description: 'Bot de Discord para servidores',
    fields: [
      { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: 'MTIzNDU2...', required: true, hint: 'Token del bot en Discord Developer Portal' },
      { key: 'guild_id', label: 'Server ID (Guild ID)', type: 'text', placeholder: '123456789012345678', required: true, hint: 'Clic derecho en el servidor → Copiar ID' },
      { key: 'channel_id', label: 'Canal ID', type: 'text', placeholder: '123456789012345678', required: true, hint: 'Clic derecho en el canal → Copiar ID' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://discord.com/api/webhooks/...', required: false, hint: 'Para notificaciones salientes (opcional)' },
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
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: '📱',
    color: 'green',
    description: 'Canal de WhatsApp Business API',
    fields: [
      { key: 'phone_number', label: 'Número de teléfono', type: 'text', placeholder: '18095551234', required: true, hint: 'Sin + ni espacios. Ej: 18095551234' },
      { key: 'business_account_id', label: 'Business Account ID', type: 'text', placeholder: '123456789012345', required: true, hint: 'ID de tu cuenta en Meta for Developers' },
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'EAABwz...', required: true, hint: 'Token permanente de Meta for Developers' },
    ],
    guide: [
      'Ve a developers.facebook.com y crea una app',
      'Agrega el producto "WhatsApp"',
      'Copia el Business Account ID',
      'Crea un System User con token permanente',
      'Agrega el número de WhatsApp Business',
      'Pega los datos y guarda',
    ],
  },
};

const STATUS_CONFIG = {
  connected: { label: 'Conectado', dot: 'bg-green-400 animate-pulse', badge: 'bg-green-50 text-green-700 border-green-200' },
  disconnected: { label: 'Desconectado', dot: 'bg-slate-300', badge: 'bg-slate-50 text-slate-500 border-slate-200' },
  error: { label: 'Error', dot: 'bg-red-400', badge: 'bg-red-50 text-red-700 border-red-200' },
};

const COLOR_MAP = {
  blue: { icon: 'bg-blue-50 text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700', ring: 'focus:ring-blue-500' },
  indigo: { icon: 'bg-indigo-50 text-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700', ring: 'focus:ring-indigo-500' },
  green: { icon: 'bg-green-50 text-green-600', btn: 'bg-green-600 hover:bg-green-700', ring: 'focus:ring-green-500' },
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.disconnected;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── ChannelCard (summary list) ───────────────────────────────────────────────

function ChannelCard({ type, channel, onSelect, selected }) {
  const meta = CHANNEL_META[type];
  const status = channel?.status ?? 'disconnected';
  const isSelected = selected === type;

  return (
    <button
      onClick={() => onSelect(isSelected ? null : type)}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        isSelected
          ? 'border-brand-300 bg-brand-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${COLOR_MAP[meta.color].icon}`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm">{meta.label}</span>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{meta.description}</p>
          {channel?.message_count > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              {channel.message_count.toLocaleString()} mensajes
            </p>
          )}
        </div>
        <span className="text-slate-400 text-sm">{isSelected ? '▲' : '▼'}</span>
      </div>
    </button>
  );
}

// ─── ChannelForm ──────────────────────────────────────────────────────────────

function ChannelForm({ type, channel, onDone }) {
  const meta = CHANNEL_META[type];
  const colors = COLOR_MAP[meta.color];
  const [form, setForm] = useState({});
  const [showSecrets, setShowSecrets] = useState({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState('');

  // Pre-fill form with existing (non-secret) values
  useEffect(() => {
    if (!channel) return;
    const initial = {};
    meta.fields.forEach(f => {
      // bot_token / access_token / bot_token_discord come back masked from API — don't pre-fill
      const secretKeys = ['bot_token', 'access_token'];
      if (!secretKeys.includes(f.key)) {
        initial[f.key] = channel[f.key] ?? '';
      }
    });
    setForm(initial);
  }, [channel, meta.fields]);

  const status = channel?.status ?? 'disconnected';
  const isConnected = status === 'connected';

  function canSave() {
    return meta.fields.filter(f => f.required).every(f => (form[f.key] ?? '').toString().trim());
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setTestResult(null);
    try {
      // Map form keys to API keys
      const payload = { ...form };
      // Discord uses bot_token but API expects bot_token (mapped server-side from bot_token_discord)
      await saveChannel(type, payload);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    setError('');
    try {
      const result = await testChannel(type);
      setTestResult(result);
      if (result.success) onDone(); // refresh status
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  }

  async function handleDisconnect() {
    if (!window.confirm(`¿Desconectar ${meta.label}? Se borrarán los tokens guardados.`)) return;
    setDisconnecting(true);
    try {
      await disconnectChannel(type);
      setForm({});
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="border border-slate-200 rounded-xl bg-white mt-2 p-5 space-y-5">
      {/* Status banner */}
      <div className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
        isConnected ? 'bg-green-50 border border-green-200' :
        status === 'error' ? 'bg-red-50 border border-red-200' :
        'bg-slate-50 border border-slate-200'
      }`}>
        <span className="text-base">{isConnected ? '✅' : status === 'error' ? '❌' : '🔌'}</span>
        <div className="flex-1">
          {isConnected ? (
            <>
              <span className="font-medium text-green-700">Bot conectado</span>
              {channel?.bot_username && <span className="text-green-600 ml-1">(@{channel.bot_username})</span>}
              {channel?.phone_number && <span className="text-green-600 ml-1">(+{channel.phone_number})</span>}
            </>
          ) : status === 'error' ? (
            <span className="font-medium text-red-700">Error de conexión — revisa las credenciales</span>
          ) : (
            <span className="text-slate-600">No conectado — configura las credenciales abajo</span>
          )}
        </div>
        {isConnected && (
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="text-xs text-red-600 hover:text-red-800 font-medium border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition disabled:opacity-50"
          >
            {disconnecting ? 'Desconectando...' : '🔌 Desconectar'}
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        {meta.fields.map(field => {
          const isSecret = field.type === 'password';
          const visible = showSecrets[field.key];
          return (
            <div key={field.key} className={field.key === 'bot_token' || field.key === 'access_token' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <div className="relative">
                <input
                  type={isSecret && !visible ? 'password' : 'text'}
                  value={form[field.key] ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${isSecret ? 'pr-10' : ''}`}
                />
                {isSecret && (
                  <button
                    type="button"
                    onClick={() => setShowSecrets(p => ({ ...p, [field.key]: !p[field.key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    {visible ? '🙈' : '👁️'}
                  </button>
                )}
              </div>
              {field.hint && <p className="mt-1 text-xs text-slate-400">{field.hint}</p>}
            </div>
          );
        })}
      </div>

      {/* Test result */}
      {testResult && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm border ${
          testResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{testResult.success ? '✅' : '❌'}</span>
          {testResult.message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving || !canSave()}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${colors.btn}`}
        >
          {saving ? '⏳ Guardando...' : '💾 Guardar'}
        </button>
        <button
          onClick={handleTest}
          disabled={testing || !canSave()}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {testing ? '⏳ Probando...' : '🧪 Probar conexión'}
        </button>
      </div>

      {/* Guide */}
      <details className="group">
        <summary className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-700 select-none">
          📖 Cómo conectar {meta.label}
        </summary>
        <ol className="mt-3 space-y-2">
          {meta.guide.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Channels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listChannels();
      setChannels(data);
    } catch (err) {
      setError(err.message);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function getChannel(type) {
    return channels.find(c => c.type === type) ?? null;
  }

  const connectedCount = channels.filter(c => c.status === 'connected').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Canales</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Conecta y gestiona los canales de mensajería del bot
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <span className={loading ? 'animate-spin inline-block' : ''}>🔄</span>
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Canales disponibles', value: 3, icon: '📡' },
          { label: 'Conectados', value: loading ? '—' : connectedCount, icon: '✅' },
          { label: 'Desconectados', value: loading ? '—' : 3 - connectedCount, icon: '🔌' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Channel list */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-400 text-sm">
          Cargando canales...
        </div>
      ) : (
        <div className="space-y-2">
          {(['telegram', 'discord', 'whatsapp']).map(type => (
            <div key={type}>
              <ChannelCard
                type={type}
                channel={getChannel(type)}
                selected={selected}
                onSelect={(t) => setSelected(t)}
              />
              {selected === type && (
                <ChannelForm
                  type={type}
                  channel={getChannel(type)}
                  onDone={() => {
                    load();
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
