import { useState, useEffect, useCallback } from 'react';
import { listSkills, createSkill, updateSkill, deleteSkill } from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

/* ── Constants ───────────────────────────────────────────────────────────── */
const TRIGGER_LABELS = { keyword: 'Palabras clave', intent: 'Intención', always: 'Siempre', fallback: 'Fallback' };
const TRIGGER_STYLES = {
  keyword:  { bg: 'rgba(79,120,255,0.12)', color: '#818cf8',  border: 'rgba(79,120,255,0.25)' },
  intent:   { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa',  border: 'rgba(139,92,246,0.25)' },
  always:   { bg: 'rgba(16,185,129,0.12)', color: '#34d399',  border: 'rgba(16,185,129,0.25)' },
  fallback: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24',  border: 'rgba(245,158,11,0.20)' },
};

function emptySkill() {
  return { name: '', description: '', trigger: 'keyword', triggerValue: '', systemPrompt: '', params: [], enabled: true };
}

/* ── Icons ───────────────────────────────────────────────────────────────── */
const IconPlus  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IconChevron = ({ open }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms ease' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
      {children}
    </label>
  );
}

/* ── Skill editor ─────────────────────────────────────────────────────────── */
function SkillEditor({ skill, onSave, onCancel, saving }) {
  const [draft, setDraft] = useState({
    name:         skill.name         || '',
    description:  skill.description  || '',
    trigger:      skill.trigger      || 'keyword',
    triggerValue: skill.trigger_value || skill.triggerValue || '',
    systemPrompt: skill.system_prompt || skill.systemPrompt || '',
    params:       skill.params ? skill.params.map(p => ({ ...p })) : [],
    enabled:      skill.enabled !== false,
  });

  const set       = (k, v) => setDraft(prev => ({ ...prev, [k]: v }));
  const addParam  = () => setDraft(prev => ({ ...prev, params: [...prev.params, { name: '', type: 'string', description: '', required: false }] }));
  const updParam  = (i, p) => setDraft(prev => { const params = [...prev.params]; params[i] = p; return { ...prev, params }; });
  const remParam  = (i)    => setDraft(prev => ({ ...prev, params: prev.params.filter((_, idx) => idx !== i) }));
  const isValid   = draft.name.trim() && draft.systemPrompt.trim();

  const inputCls  = 'input-dark w-full rounded-xl px-3 py-2.5 text-sm';
  const selectCls = 'select-dark rounded-xl px-3 py-2.5 text-sm';

  return (
    <div className="glass-card p-6 space-y-5 float-in">
      {/* Name + enabled */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <FieldLabel>Nombre</FieldLabel>
          <input value={draft.name} onChange={e => set('name', e.target.value)} placeholder="Nombre de la skill" className={inputCls} />
        </div>
        <div className="mt-5">
          <button onClick={() => set('enabled', !draft.enabled)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
            style={draft.enabled
              ? { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.40)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: draft.enabled ? '#10b981' : 'rgba(255,255,255,0.3)' }} />
            {draft.enabled ? 'Habilitada' : 'Deshabilitada'}
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <FieldLabel>Descripción</FieldLabel>
        <input value={draft.description} onChange={e => set('description', e.target.value)} placeholder="Breve descripción de cuándo se usa" className={inputCls} />
      </div>

      {/* Trigger */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Activación</FieldLabel>
          <select value={draft.trigger} onChange={e => set('trigger', e.target.value)} className={`${selectCls} w-full`}>
            {Object.entries(TRIGGER_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        {(draft.trigger === 'keyword' || draft.trigger === 'intent') && (
          <div>
            <FieldLabel>{draft.trigger === 'keyword' ? 'Palabras clave (coma)' : 'Frases de intención'}</FieldLabel>
            <input value={draft.triggerValue} onChange={e => set('triggerValue', e.target.value)}
              placeholder={draft.trigger === 'keyword' ? 'hola, hi, buenas' : 'quiero info, me interesa'}
              className={inputCls} />
          </div>
        )}
      </div>

      {/* System prompt */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>System Prompt</FieldLabel>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{draft.systemPrompt.length} caracteres</span>
        </div>
        <textarea rows={6} value={draft.systemPrompt} onChange={e => set('systemPrompt', e.target.value)}
          placeholder="Instrucciones que seguirá el bot cuando se active esta skill…"
          className="textarea-dark w-full rounded-xl px-3 py-2.5 text-sm leading-relaxed" />
      </div>

      {/* Params */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel>Parámetros</FieldLabel>
          <button onClick={addParam} className="text-xs font-medium transition-colors" style={{ color: '#e63030' }}>+ Agregar</button>
        </div>
        {draft.params.length === 0
          ? <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Sin parámetros.</p>
          : (
            <div className="space-y-2">
              {draft.params.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_2fr_55px_28px] items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <input value={p.name} onChange={e => updParam(i, { ...p, name: e.target.value })} placeholder="nombre"
                    className="bg-transparent text-sm outline-none" style={{ color: 'rgba(255,255,255,0.75)' }} />
                  <select value={p.type} onChange={e => updParam(i, { ...p, type: e.target.value })}
                    className="bg-transparent text-sm outline-none" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {['string','number','boolean'].map(t => <option key={t} value={t} style={{ background: '#1a1a1a' }}>{t}</option>)}
                  </select>
                  <input value={p.description} onChange={e => updParam(i, { ...p, description: e.target.value })} placeholder="descripción"
                    className="bg-transparent text-sm outline-none" style={{ color: 'rgba(255,255,255,0.60)' }} />
                  <button onClick={() => updParam(i, { ...p, required: !p.required })}
                    className="text-xs font-medium rounded-md px-1.5 py-0.5"
                    style={p.required
                      ? { background: 'rgba(230,48,48,0.12)', color: '#ff8080', border: '1px solid rgba(230,48,48,0.20)' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.40)' }}>
                    {p.required ? 'req.' : 'opt.'}
                  </button>
                  <button onClick={() => remParam(i)} className="text-lg leading-none transition-colors"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e63030'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>×</button>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onCancel} className="btn-ghost px-4 py-2 rounded-xl text-sm font-medium">Cancelar</button>
        <button onClick={() => onSave(draft)} disabled={!isValid || saving}
          className="btn-red flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold">
          {saving ? <Spinner size="sm" /> : null} Guardar
        </button>
      </div>
    </div>
  );
}

/* ── Skill card ───────────────────────────────────────────────────────────── */
function SkillCard({ skill, onEdit, onDelete, onToggle, deleting }) {
  const [expanded, setExpanded] = useState(false);
  const tStyle = TRIGGER_STYLES[skill.trigger] || { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.10)' };

  return (
    <div className="glass-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(255,255,255,0.05)] group relative" style={!skill.enabled ? { opacity: 0.45 } : {}}>
      {/* Background glow base on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="flex items-center gap-4 px-5 py-4 relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(230,48,48,0.3)]"
          style={{ background: 'rgba(230,48,48,0.10)', border: '1px solid rgba(230,48,48,0.18)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e63030" strokeWidth="2" strokeLinecap="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold truncate transition-colors duration-300 group-hover:text-white" style={{ color: 'rgba(255,255,255,0.85)' }}>{skill.name}</span>
            <span className="text-[10px] font-semibold rounded-full px-2 py-0.5"
              style={{ background: tStyle.bg, color: tStyle.color, border: `1px solid ${tStyle.border}` }}>
              {TRIGGER_LABELS[skill.trigger] || skill.trigger}
            </span>
            {!skill.enabled && (
              <span className="text-[10px] rounded-full px-2 py-0.5"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.30)' }}>Inactiva</span>
            )}
          </div>
          {skill.description && <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>{skill.description}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {[
            { onClick: onToggle,  icon: <div className="w-3.5 h-3.5 rounded-full" style={{ background: skill.enabled ? '#10b981' : 'rgba(255,255,255,0.2)', boxShadow: skill.enabled ? '0 0 4px rgba(16,185,129,0.5)' : 'none' }} />, title: skill.enabled ? 'Deshabilitar' : 'Habilitar' },
            { onClick: onEdit,    icon: <IconEdit />,   title: 'Editar' },
            { onClick: onDelete,  icon: deleting ? '…' : <IconTrash />, title: 'Eliminar', danger: true, disabled: deleting },
            { onClick: () => setExpanded(v => !v), icon: <IconChevron open={expanded} />, title: 'Expandir' },
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick} disabled={btn.disabled} title={btn.title}
              className="flex items-center justify-center w-8 h-8 rounded-xl transition-all disabled:opacity-40"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.background = btn.danger ? 'rgba(230,48,48,0.10)' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = btn.danger ? '#e63030' : 'rgba(255,255,255,0.70)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}>
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 pt-3 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {skill.trigger_value && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {skill.trigger === 'keyword' ? 'Palabras clave' : 'Frases'}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{skill.trigger_value}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>System Prompt</p>
            <p className="text-xs leading-relaxed line-clamp-4" style={{ color: 'rgba(255,255,255,0.55)' }}>{skill.system_prompt}</p>
          </div>
          {skill.params?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                Parámetros ({skill.params.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skill.params.map((p, i) => (
                  <span key={i} className="font-mono text-[10px] px-2.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {p.name}: {p.type}{p.required ? '' : '?'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function Skills() {
  const [skills,     setSkills]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [editing,    setEditing]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try   { setSkills(await listSkills(true)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (draft) => {
    setSaving(true);
    try {
      editing.isNew ? await createSkill(draft) : await updateSkill(editing.skill.id, draft);
      setEditing(null); await load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta skill?')) return;
    setDeletingId(id);
    try { await deleteSkill(id); setSkills(prev => prev.filter(s => s.id !== id)); }
    catch (err) { setError(err.message); }
    finally { setDeletingId(null); }
  };

  const handleToggle = async (skill) => {
    try {
      await updateSkill(skill.id, { enabled: !skill.enabled });
      setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, enabled: !s.enabled } : s));
    } catch (err) { setError(err.message); }
  };

  const activeCount = skills.filter(s => s.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between float-in">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>Skills</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Habilidades que usa Missy al responder</p>
        </div>
        <button onClick={() => setEditing({ skill: emptySkill(), isNew: true })} disabled={!!editing}
          className="btn-red flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40">
          <IconPlus /> Nueva skill
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 float-in stagger-1">
        {[
          { label: 'Skills totales',  value: skills.length,                  accent: undefined },
          { label: 'Habilitadas',     value: activeCount,                    accent: '#10b981' },
          { label: 'Deshabilitadas',  value: skills.length - activeCount,    accent: '#f59e0b' },
        ].map(({ label, value, accent }) => (
          <div key={label} 
               className="glass-card p-5 flex flex-col gap-2 group transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(255,255,255,0.06)] relative overflow-hidden" 
               style={accent ? { borderColor: `${accent}28` } : {}}>
            {accent && <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />}
            <div className="w-1.5 h-1.5 rounded-full transition-transform duration-300 group-hover:scale-150" style={{ background: accent || 'rgba(255,255,255,0.20)', boxShadow: accent ? `0 0 8px ${accent}` : 'none' }} />
            <p className="text-2xl font-bold tabular-nums transition-transform duration-300 group-hover:scale-105 origin-left" style={{ color: accent || 'rgba(255,255,255,0.90)' }}>{value}</p>
            <p className="text-xs transition-colors duration-300 group-hover:text-white" style={{ color: 'rgba(255,255,255,0.38)' }}>{label}</p>
          </div>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={load} />}

      {editing && (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: '#f59e0b' }}>
            {editing.isNew ? 'Creando nueva skill' : `Editando: ${editing.skill.name || 'sin nombre'}`}
          </p>
          <SkillEditor skill={editing.skill} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : skills.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-4 py-16 text-center float-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(230,48,48,0.10)', border: '1px solid rgba(230,48,48,0.20)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e63030" strokeWidth="1.8" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>No hay skills definidas</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Crea la primera skill para que Missy sepa cómo responder</p>
          </div>
          <button onClick={() => setEditing({ skill: emptySkill(), isNew: true })}
            className="btn-red flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
            <IconPlus /> Crear primera skill
          </button>
        </div>
      ) : (
        <div className="space-y-3 float-in stagger-2">
          {skills.map(skill => (
            <SkillCard key={skill.id} skill={skill}
              onEdit={() => setEditing({ skill, isNew: false })}
              onDelete={() => handleDelete(skill.id)}
              onToggle={() => handleToggle(skill)}
              deleting={deletingId === skill.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
