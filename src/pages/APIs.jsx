import { useState, useEffect, useCallback } from 'react';
import {
  listApis,
  createApi,
  updateApi,
  deleteApi,
  testApi,
} from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTH_TYPES = {
  none: 'Sin autenticación',
  bearer: 'Bearer Token',
  api_key: 'API Key (header)',
  basic: 'Basic Auth',
  query_param: 'Query Param',
};

const METHOD_COLORS = {
  GET: 'bg-emerald-100 text-emerald-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700',
  PATCH: 'bg-orange-100 text-orange-700',
  DELETE: 'bg-red-100 text-red-700',
};

function emptyApi() {
  return {
    name: '',
    description: '',
    base_url: '',
    method: 'GET',
    endpoint: '',
    auth_type: 'none',
    auth_value: '',
    auth_header: 'Authorization',
    auth_param: 'api_key',
    headers: [],
    body_template: '',
    response_path: '',
    enabled: true,
  };
}

// ─── API Editor ───────────────────────────────────────────────────────────────

function ApiEditor({ api, onSave, onCancel, saving }) {
  const [draft, setDraft] = useState({
    name: api.name || '',
    description: api.description || '',
    base_url: api.base_url || '',
    method: api.method || 'GET',
    endpoint: api.endpoint || '',
    auth_type: api.auth_type || 'none',
    auth_value: api.auth_value || '',
    auth_header: api.auth_header || 'Authorization',
    auth_param: api.auth_param || 'api_key',
    headers: api.headers ? api.headers.map((h) => ({ ...h })) : [],
    body_template: api.body_template || '',
    response_path: api.response_path || '',
    enabled: api.enabled !== false,
  });
  const [showSecret, setShowSecret] = useState(false);

  function set(key, val) {
    setDraft((prev) => ({ ...prev, [key]: val }));
  }

  function addHeader() {
    setDraft((prev) => ({
      ...prev,
      headers: [...prev.headers, { key: '', value: '' }],
    }));
  }

  function updateHeader(i, h) {
    setDraft((prev) => {
      const headers = [...prev.headers];
      headers[i] = h;
      return { ...prev, headers };
    });
  }

  function removeHeader(i) {
    setDraft((prev) => ({ ...prev, headers: prev.headers.filter((_, idx) => idx !== i) }));
  }

  const isValid = draft.name.trim() && draft.base_url.trim();
  const showAuthValue = draft.auth_type !== 'none';
  const showAuthHeader = draft.auth_type === 'api_key';
  const showAuthParam = draft.auth_type === 'query_param';
  const showBody = ['POST', 'PUT', 'PATCH'].includes(draft.method);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
      {/* Name + enabled */}
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nombre</label>
          <input
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Nombre de la API (ej. CRM Leads)"
            className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition"
          />
        </div>
        <div className="mt-5">
          <button
            onClick={() => set('enabled', !draft.enabled)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
              draft.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {draft.enabled ? '✓ Habilitada' : '○ Deshabilitada'}
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Descripción</label>
        <input
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="¿Para qué usa el bot esta API?"
          className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition"
        />
      </div>

      {/* Method + URL */}
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Endpoint</label>
        <div className="flex gap-2">
          <select
            value={draft.method}
            onChange={(e) => set('method', e.target.value)}
            className="border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition bg-white w-28 shrink-0"
          >
            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            value={draft.base_url}
            onChange={(e) => set('base_url', e.target.value)}
            placeholder="https://api.ejemplo.com"
            className="flex-1 border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition"
          />
          <input
            value={draft.endpoint}
            onChange={(e) => set('endpoint', e.target.value)}
            placeholder="/v1/leads"
            className="w-40 border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition"
          />
        </div>
        <p className="text-[10px] text-slate-400">
          URL completa: <span className="font-mono">{draft.base_url}{draft.endpoint || ''}</span>
        </p>
      </div>

      {/* Auth */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Autenticación</label>
        <select
          value={draft.auth_type}
          onChange={(e) => set('auth_type', e.target.value)}
          className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition bg-white"
        >
          {Object.entries(AUTH_TYPES).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        {showAuthValue && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">
                {draft.auth_type === 'basic' ? 'Usuario:Contraseña' : 'Token / Clave'}
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={draft.auth_value}
                  onChange={(e) => set('auth_value', e.target.value)}
                  placeholder={draft.auth_type === 'basic' ? 'usuario:contraseña' : 'sk-...'}
                  className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  {showSecret ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            {showAuthHeader && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Header name</label>
                <input
                  value={draft.auth_header}
                  onChange={(e) => set('auth_header', e.target.value)}
                  placeholder="X-API-Key"
                  className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition"
                />
              </div>
            )}
            {showAuthParam && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Query param name</label>
                <input
                  value={draft.auth_param}
                  onChange={(e) => set('auth_param', e.target.value)}
                  placeholder="api_key"
                  className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom headers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Headers adicionales</label>
          <button onClick={addHeader} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition">
            + Agregar
          </button>
        </div>
        {draft.headers.length === 0 ? (
          <p className="text-xs text-slate-400">Sin headers adicionales.</p>
        ) : (
          <div className="space-y-2">
            {draft.headers.map((h, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_28px] items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <input
                  value={h.key}
                  onChange={(e) => updateHeader(i, { ...h, key: e.target.value })}
                  placeholder="Content-Type"
                  className="bg-transparent text-sm outline-none font-mono"
                />
                <input
                  value={h.value}
                  onChange={(e) => updateHeader(i, { ...h, value: e.target.value })}
                  placeholder="application/json"
                  className="bg-transparent text-sm outline-none"
                />
                <button onClick={() => removeHeader(i)} className="text-slate-400 hover:text-red-500 text-base leading-none">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Body template */}
      {showBody && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Body (JSON template)</label>
            <span className="text-[10px] text-slate-400">Usa {'{{variable}}'} para valores dinámicos</span>
          </div>
          <textarea
            rows={5}
            value={draft.body_template}
            onChange={(e) => set('body_template', e.target.value)}
            placeholder={'{\n  "name": "{{lead_name}}",\n  "phone": "{{phone}}"\n}'}
            className="w-full resize-y border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm font-mono leading-relaxed outline-none transition"
          />
        </div>
      )}

      {/* Response path */}
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ruta de respuesta</label>
        <input
          value={draft.response_path}
          onChange={(e) => set('response_path', e.target.value)}
          placeholder="data.result (opcional — extrae campo específico)"
          className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition"
        />
        <p className="text-[10px] text-slate-400">
          Si la respuesta es <span className="font-mono">{'{"data":{"result":"..."}}'}</span>, escribe <span className="font-mono">data.result</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Cancelar
        </button>
        <button
          onClick={() => onSave(draft)}
          disabled={!isValid || saving}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? <Spinner size="sm" /> : '💾'} Guardar
        </button>
      </div>
    </div>
  );
}

// ─── API Card ─────────────────────────────────────────────────────────────────

function ApiCard({ api, onEdit, onDelete, onToggle, onTest, deleting, testing }) {
  const [expanded, setExpanded] = useState(false);
  const [testResult, setTestResult] = useState(null);

  async function handleTest() {
    setTestResult(null);
    const result = await onTest(api.id);
    setTestResult(result);
  }

  const fullUrl = `${api.base_url || ''}${api.endpoint || ''}`;

  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-opacity ${!api.enabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center text-base shrink-0">🔌</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 truncate">{api.name}</span>
            <span className={`text-[10px] font-bold rounded px-1.5 py-0.5 ${METHOD_COLORS[api.method] || 'bg-slate-100 text-slate-500'}`}>
              {api.method}
            </span>
            <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-slate-100 text-slate-500 font-mono truncate max-w-xs">
              {fullUrl}
            </span>
            {!api.enabled && (
              <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-slate-100 text-slate-400">Inactiva</span>
            )}
          </div>
          {api.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{api.description}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleTest}
            disabled={testing}
            title="Probar conexión"
            className="text-sm px-2 py-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition disabled:opacity-40"
          >
            {testing ? '⏳' : '🧪'}
          </button>
          <button onClick={onToggle} title={api.enabled ? 'Deshabilitar' : 'Habilitar'} className={`text-sm px-2 py-1.5 rounded-lg transition hover:bg-slate-100 ${api.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>✓</button>
          <button onClick={onEdit} className="text-sm px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">✎</button>
          <button onClick={onDelete} disabled={deleting} className="text-sm px-2 py-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40">
            {deleting ? '…' : '🗑'}
          </button>
          <button onClick={() => setExpanded((v) => !v)} className="text-sm px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Test result inline */}
      {testResult && (
        <div className={`mx-5 mb-3 flex items-start gap-2 rounded-lg px-4 py-3 text-sm border ${
          testResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{testResult.success ? '✅' : '❌'}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium">{testResult.success ? 'Conexión exitosa' : 'Error de conexión'}</p>
            {testResult.message && <p className="text-xs mt-0.5 opacity-80">{testResult.message}</p>}
            {testResult.status_code && (
              <p className="text-xs mt-0.5 font-mono opacity-70">HTTP {testResult.status_code}</p>
            )}
          </div>
          <button onClick={() => setTestResult(null)} className="text-xs opacity-50 hover:opacity-100 shrink-0">×</button>
        </div>
      )}

      {expanded && (
        <div className="border-t border-slate-100 px-5 pb-4 pt-3 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">URL completa</span>
              <p className="mt-1 text-xs font-mono text-slate-600 break-all">{fullUrl || '—'}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Autenticación</span>
              <p className="mt-1 text-xs text-slate-600">{AUTH_TYPES[api.auth_type] || api.auth_type}</p>
            </div>
          </div>
          {api.headers && api.headers.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Headers adicionales</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {api.headers.map((h, i) => (
                  <span key={i} className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                    {h.key}: {h.value}
                  </span>
                ))}
              </div>
            </div>
          )}
          {api.body_template && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Body template</span>
              <pre className="mt-1 text-[11px] font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 overflow-x-auto">
                {api.body_template}
              </pre>
            </div>
          )}
          {api.response_path && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Ruta de respuesta</span>
              <p className="mt-1 text-xs font-mono text-slate-600">{api.response_path}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function APIs() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [testingId, setTestingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listApis();
      setApis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => setEditing({ api: emptyApi(), isNew: true });
  const cancelEdit = () => setEditing(null);

  const handleSave = async (draft) => {
    setSaving(true);
    try {
      if (editing.isNew) {
        await createApi(draft);
      } else {
        await updateApi(editing.api.id, draft);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta API?')) return;
    setDeletingId(id);
    try {
      await deleteApi(id);
      setApis((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (api) => {
    try {
      await updateApi(api.id, { enabled: !api.enabled });
      setApis((prev) => prev.map((a) => a.id === api.id ? { ...a, enabled: !a.enabled } : a));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTest = async (id) => {
    setTestingId(id);
    try {
      return await testApi(id);
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setTestingId(null);
    }
  };

  const activeCount = apis.filter((a) => a.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">APIs</h1>
          <p className="text-sm text-slate-500 mt-0.5">Conecta APIs externas que el bot puede usar al responder</p>
        </div>
        <button
          onClick={startNew}
          disabled={!!editing}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Nueva API
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'APIs totales', value: apis.length, color: 'text-slate-800' },
          { label: 'Habilitadas', value: activeCount, color: 'text-emerald-600' },
          { label: 'Deshabilitadas', value: apis.length - activeCount, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={load} />}

      {/* Editor */}
      {editing && (
        <div>
          <p className="text-sm font-medium text-amber-600 mb-3">
            ⚠ {editing.isNew ? 'Conectando nueva API' : `Editando: ${editing.api.name || 'sin nombre'}`}
          </p>
          <ApiEditor api={editing.api} onSave={handleSave} onCancel={cancelEdit} saving={saving} />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : apis.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-4xl">🔌</div>
          <div>
            <p className="font-semibold text-slate-700">No hay APIs conectadas</p>
            <p className="text-sm text-slate-400 mt-1">Agrega una API para que el bot pueda consultarla al responder</p>
          </div>
          <button
            onClick={startNew}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            + Conectar primera API
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {apis.map((api) => (
            <ApiCard
              key={api.id}
              api={api}
              onEdit={() => setEditing({ api, isNew: false })}
              onDelete={() => handleDelete(api.id)}
              onToggle={() => handleToggle(api)}
              onTest={handleTest}
              deleting={deletingId === api.id}
              testing={testingId === api.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
