import { useState, useEffect, useCallback } from 'react';
import { listApis, createApi, updateApi, deleteApi, testApi } from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

/* ── Constants ───────────────────────────────────────────────────────────── */
const AUTH_TYPES = {
  none:        'Sin autenticación',
  bearer:      'Bearer Token',
  api_key:     'API Key (header)',
  basic:       'Basic Auth',
  query_param: 'Query Param',
};

const METHOD_STYLES = {
  GET:    { bg: 'rgba(16,185,129,0.12)',  color: '#34d399',  border: 'rgba(16,185,129,0.25)' },
  POST:   { bg: 'rgba(79,120,255,0.12)',  color: '#818cf8',  border: 'rgba(79,120,255,0.25)' },
  PUT:    { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24',  border: 'rgba(245,158,11,0.20)' },
  PATCH:  { bg: 'rgba(249,115,22,0.12)',  color: '#fb923c',  border: 'rgba(249,115,22,0.20)' },
  DELETE: { bg: 'rgba(230,48,48,0.12)',   color: '#ff8080',  border: 'rgba(230,48,48,0.25)' },
};

function emptyApi() {
  return {
    name: '', description: '', base_url: '', method: 'GET', endpoint: '',
    auth_type: 'none', auth_value: '', auth_header: 'Authorization',
    auth_param: 'api_key', headers: [], body_template: '', response_path: '', enabled: true,
  };
}

/* ── Icons ───────────────────────────────────────────────────────────────── */
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
);
const IconTest = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
);
const IconChevron = ({ open }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms ease' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
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

/* ── Shared field label ──────────────────────────────────────────────────── */
function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
      style={{ color: 'rgba(255,255,255,0.35)' }}>
      {children}
    </label>
  );
}

/* ── API Editor ──────────────────────────────────────────────────────────── */
function ApiEditor({ api, onSave, onCancel, saving }) {
  const [draft, setDraft] = useState({
    name: api.name || '', description: api.description || '',
    base_url: api.base_url || '', method: api.method || 'GET',
    endpoint: api.endpoint || '', auth_type: api.auth_type || 'none',
    auth_value: api.auth_value || '', auth_header: api.auth_header || 'Authorization',
    auth_param: api.auth_param || 'api_key',
    headers: api.headers ? api.headers.map(h => ({ ...h })) : [],
    body_template: api.body_template || '', response_path: api.response_path || '',
    enabled: api.enabled !== false,
  });
  const [showSecret, setShowSecret] = useState(false);

  const set = (key, val) => setDraft(prev => ({ ...prev, [key]: val }));
  const addHeader = () => setDraft(prev => ({ ...prev, headers: [...prev.headers, { key: '', value: '' }] }));
  const updateHeader = (i, h) => setDraft(prev => { const headers = [...prev.headers]; headers[i] = h; return { ...prev, headers }; });
  const removeHeader = (i) => setDraft(prev => ({ ...prev, headers: prev.headers.filter((_, idx) => idx !== i) }));

  const isValid = draft.name.trim() && draft.base_url.trim();
  const showBody = ['POST', 'PUT', 'PATCH'].includes(draft.method);

  const inputCls = 'input-dark w-full rounded-xl px-3 py-2.5 text-sm';
  const selectCls = 'select-dark w-full rounded-xl px-3 py-2.5 text-sm';

  return (
    <div className="glass-card p-6 space-y-5 float-in">
      {/* Name + enabled */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <FieldLabel>Nombre</FieldLabel>
          <input value={draft.name} onChange={e => set('name', e.target.value)}
            placeholder="Nombre de la API" className={inputCls} />
        </div>
        <div className="mt-5">
          <button
            onClick={() => set('enabled', !draft.enabled)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
            style={draft.enabled
              ? { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.40)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: draft.enabled ? '#10b981' : 'rgba(255,255,255,0.3)' }} />
            {draft.enabled ? 'Habilitada' : 'Deshabilitada'}
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <FieldLabel>Descripción</FieldLabel>
        <input value={draft.description} onChange={e => set('description', e.target.value)}
          placeholder="¿Para qué usa el bot esta API?" className={inputCls} />
      </div>

      {/* Method + URL */}
      <div>
        <FieldLabel>Endpoint</FieldLabel>
        <div className="flex gap-2">
          <select value={draft.method} onChange={e => set('method', e.target.value)}
            className="select-dark rounded-xl px-3 py-2.5 text-sm w-28 shrink-0">
            {['GET','POST','PUT','PATCH','DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input value={draft.base_url} onChange={e => set('base_url', e.target.value)}
            placeholder="https://api.ejemplo.com" className={`${inputCls} flex-1`} />
          <input value={draft.endpoint} onChange={e => set('endpoint', e.target.value)}
            placeholder="/v1/leads" className={`${inputCls} w-36`} />
        </div>
        <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          URL: <span className="font-mono">{draft.base_url}{draft.endpoint}</span>
        </p>
      </div>

      {/* Auth */}
      <div className="space-y-3">
        <FieldLabel>Autenticación</FieldLabel>
        <select value={draft.auth_type} onChange={e => set('auth_type', e.target.value)} className={selectCls}>
          {Object.entries(AUTH_TYPES).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
        </select>
        {draft.auth_type !== 'none' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>{draft.auth_type === 'basic' ? 'Usuario:Contraseña' : 'Token / Clave'}</FieldLabel>
              <div className="relative">
                <input type={showSecret ? 'text' : 'password'} value={draft.auth_value}
                  onChange={e => set('auth_value', e.target.value)}
                  placeholder={draft.auth_type === 'basic' ? 'usuario:contraseña' : 'sk-…'}
                  className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowSecret(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <IconEye show={showSecret} />
                </button>
              </div>
            </div>
            {draft.auth_type === 'api_key' && (
              <div>
                <FieldLabel>Header name</FieldLabel>
                <input value={draft.auth_header} onChange={e => set('auth_header', e.target.value)}
                  placeholder="X-API-Key" className={inputCls} />
              </div>
            )}
            {draft.auth_type === 'query_param' && (
              <div>
                <FieldLabel>Query param name</FieldLabel>
                <input value={draft.auth_param} onChange={e => set('auth_param', e.target.value)}
                  placeholder="api_key" className={inputCls} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom headers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel>Headers adicionales</FieldLabel>
          <button onClick={addHeader} className="text-xs font-medium transition-colors" style={{ color: '#e63030' }}>
            + Agregar
          </button>
        </div>
        {draft.headers.length === 0
          ? <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Sin headers adicionales.</p>
          : (
            <div className="space-y-2">
              {draft.headers.map((h, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_28px] items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <input value={h.key} onChange={e => updateHeader(i, { ...h, key: e.target.value })}
                    placeholder="Content-Type"
                    className="bg-transparent text-sm outline-none font-mono"
                    style={{ color: 'rgba(255,255,255,0.75)' }} />
                  <input value={h.value} onChange={e => updateHeader(i, { ...h, value: e.target.value })}
                    placeholder="application/json"
                    className="bg-transparent text-sm outline-none"
                    style={{ color: 'rgba(255,255,255,0.65)' }} />
                  <button onClick={() => removeHeader(i)} className="transition-colors text-lg leading-none"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e63030'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>×</button>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Body template */}
      {showBody && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <FieldLabel>Body (JSON template)</FieldLabel>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Usa {'{{variable}}'} para valores dinámicos</span>
          </div>
          <textarea rows={5} value={draft.body_template} onChange={e => set('body_template', e.target.value)}
            placeholder={'{\n  "name": "{{lead_name}}"\n}'}
            className="textarea-dark w-full rounded-xl px-3 py-2.5 text-sm font-mono leading-relaxed" />
        </div>
      )}

      {/* Response path */}
      <div>
        <FieldLabel>Ruta de respuesta</FieldLabel>
        <input value={draft.response_path} onChange={e => set('response_path', e.target.value)}
          placeholder="data.result (opcional)" className={inputCls} />
        <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Si la respuesta es <span className="font-mono">{'{"data":{"result":"..."}}'}</span>, escribe <span className="font-mono">data.result</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onCancel} className="btn-ghost px-4 py-2 rounded-xl text-sm font-medium">
          Cancelar
        </button>
        <button onClick={() => onSave(draft)} disabled={!isValid || saving}
          className="btn-red flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold">
          {saving ? <Spinner size="sm" /> : null} Guardar
        </button>
      </div>
    </div>
  );
}

/* ── API Card ────────────────────────────────────────────────────────────── */
function ApiCard({ api, onEdit, onDelete, onToggle, onTest, deleting, testing }) {
  const [expanded, setExpanded] = useState(false);
  const [testResult, setTestResult] = useState(null);

  async function handleTest() {
    setTestResult(null);
    const result = await onTest(api.id);
    setTestResult(result);
  }

  const fullUrl = `${api.base_url || ''}${api.endpoint || ''}`;
  const mStyle  = METHOD_STYLES[api.method] || { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.10)' };

  return (
    <div
      className="glass-card overflow-hidden transition-opacity"
      style={!api.enabled ? { opacity: 0.45 } : {}}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(230,48,48,0.12)', border: '1px solid rgba(230,48,48,0.20)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e63030" strokeWidth="2" strokeLinecap="round">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{api.name}</span>
            <span className="text-[10px] font-bold rounded-md px-1.5 py-0.5"
              style={{ background: mStyle.bg, color: mStyle.color, border: `1px solid ${mStyle.border}` }}>
              {api.method}
            </span>
            <span className="text-[10px] font-mono rounded-full px-2 py-0.5 truncate max-w-xs"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {fullUrl}
            </span>
            {!api.enabled && (
              <span className="text-[10px] rounded-full px-2 py-0.5"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.30)' }}>Inactiva</span>
            )}
          </div>
          {api.description && <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>{api.description}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {[
            { onClick: handleTest, disabled: testing, icon: testing ? <Spinner size="sm" /> : <IconTest />, title: 'Probar' },
            { onClick: onToggle, icon: (
              <div className="w-3.5 h-3.5 rounded-full" style={{ background: api.enabled ? '#10b981' : 'rgba(255,255,255,0.2)', boxShadow: api.enabled ? '0 0 4px rgba(16,185,129,0.5)' : 'none' }} />
            ), title: api.enabled ? 'Deshabilitar' : 'Habilitar' },
            { onClick: onEdit, icon: <IconEdit />, title: 'Editar' },
            { onClick: onDelete, disabled: deleting, icon: deleting ? '…' : <IconTrash />, title: 'Eliminar', danger: true },
            { onClick: () => setExpanded(v => !v), icon: <IconChevron open={expanded} />, title: expanded ? 'Colapsar' : 'Expandir' },
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick} disabled={btn.disabled} title={btn.title}
              className="flex items-center justify-center w-8 h-8 rounded-xl transition-all disabled:opacity-40"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.background = btn.danger ? 'rgba(230,48,48,0.10)' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = btn.danger ? '#e63030' : 'rgba(255,255,255,0.70)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Test result */}
      {testResult && (
        <div className="mx-5 mb-3 flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
          style={testResult.success
            ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }
            : { background: 'rgba(230,48,48,0.08)', border: '1px solid rgba(230,48,48,0.25)', color: '#ff8080' }}>
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
            style={{ background: testResult.success ? '#10b981' : '#e63030' }} />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{testResult.success ? 'Conexión exitosa' : 'Error de conexión'}</p>
            {testResult.message && <p className="text-xs mt-0.5 opacity-75">{testResult.message}</p>}
            {testResult.status_code && <p className="text-xs mt-0.5 font-mono opacity-60">HTTP {testResult.status_code}</p>}
          </div>
          <button onClick={() => setTestResult(null)} className="text-xs opacity-40 hover:opacity-80 shrink-0">×</button>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-4 pt-3 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>URL completa</p>
              <p className="text-xs font-mono break-all" style={{ color: 'rgba(255,255,255,0.55)' }}>{fullUrl || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>Autenticación</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{AUTH_TYPES[api.auth_type] || api.auth_type}</p>
            </div>
          </div>
          {api.headers?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>Headers adicionales</p>
              <div className="flex flex-wrap gap-1.5">
                {api.headers.map((h, i) => (
                  <span key={i} className="font-mono text-[10px] px-2.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {h.key}: {h.value}
                  </span>
                ))}
              </div>
            </div>
          )}
          {api.body_template && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>Body template</p>
              <pre className="text-[11px] font-mono rounded-xl px-3 py-2 overflow-x-auto"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}>
                {api.body_template}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function APIs() {
  const [apis,       setApis]      = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');
  const [editing,    setEditing]   = useState(null);
  const [saving,     setSaving]    = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [testingId,  setTestingId]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try   { setApis(await listApis()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (draft) => {
    setSaving(true);
    try {
      editing.isNew ? await createApi(draft) : await updateApi(editing.api.id, draft);
      setEditing(null); await load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta API?')) return;
    setDeletingId(id);
    try { await deleteApi(id); setApis(prev => prev.filter(a => a.id !== id)); }
    catch (err) { setError(err.message); }
    finally { setDeletingId(null); }
  };

  const handleToggle = async (api) => {
    try {
      await updateApi(api.id, { enabled: !api.enabled });
      setApis(prev => prev.map(a => a.id === api.id ? { ...a, enabled: !a.enabled } : a));
    } catch (err) { setError(err.message); }
  };

  const handleTest = async (id) => {
    setTestingId(id);
    try   { return await testApi(id); }
    catch (err) { return { success: false, message: err.message }; }
    finally { setTestingId(null); }
  };

  const activeCount = apis.filter(a => a.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between float-in">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>APIs</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Conecta APIs externas que el bot puede usar al responder
          </p>
        </div>
        <button onClick={() => setEditing({ api: emptyApi(), isNew: true })}
          disabled={!!editing}
          className="btn-red flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40">
          <IconPlus /> Nueva API
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'APIs totales',     value: apis.length,                   accent: undefined },
          { label: 'Habilitadas',      value: activeCount,                   accent: '#10b981' },
          { label: 'Deshabilitadas',   value: apis.length - activeCount,     accent: '#f59e0b' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="glass-card float-in p-5 flex flex-col gap-2"
            style={accent ? { borderColor: `${accent}28` } : {}}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent || 'rgba(255,255,255,0.20)' }} />
            <p className="text-2xl font-bold tabular-nums" style={{ color: accent || 'rgba(255,255,255,0.90)' }}>{value}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{label}</p>
          </div>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={load} />}

      {/* Editor */}
      {editing && (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: '#f59e0b' }}>
            {editing.isNew ? 'Conectando nueva API' : `Editando: ${editing.api.name || 'sin nombre'}`}
          </p>
          <ApiEditor api={editing.api} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : apis.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-4 py-16 text-center float-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(230,48,48,0.10)', border: '1px solid rgba(230,48,48,0.20)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e63030" strokeWidth="1.8" strokeLinecap="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>No hay APIs conectadas</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Agrega una API para que el bot pueda consultarla al responder
            </p>
          </div>
          <button onClick={() => setEditing({ api: emptyApi(), isNew: true })}
            className="btn-red flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
            <IconPlus /> Conectar primera API
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {apis.map(api => (
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
