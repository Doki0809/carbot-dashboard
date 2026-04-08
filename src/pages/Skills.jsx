import { useState, useEffect, useCallback } from 'react';
import { listSkills, createSkill, updateSkill, deleteSkill } from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const TRIGGER_LABELS = {
  keyword: 'Palabras clave',
  intent: 'Intención',
  always: 'Siempre',
  fallback: 'Fallback',
};

const TRIGGER_COLORS = {
  keyword: 'bg-blue-100 text-blue-700',
  intent: 'bg-purple-100 text-purple-700',
  always: 'bg-emerald-100 text-emerald-700',
  fallback: 'bg-amber-100 text-amber-700',
};

function emptySkill() {
  return {
    name: '',
    description: '',
    trigger: 'keyword',
    triggerValue: '',
    systemPrompt: '',
    params: [],
    enabled: true,
  };
}

// ─── Skill editor ─────────────────────────────────────────────────────────────

function SkillEditor({ skill, onSave, onCancel, saving }) {
  const [draft, setDraft] = useState({
    name: skill.name || '',
    description: skill.description || '',
    trigger: skill.trigger || 'keyword',
    triggerValue: skill.trigger_value || skill.triggerValue || '',
    systemPrompt: skill.system_prompt || skill.systemPrompt || '',
    params: skill.params ? skill.params.map((p) => ({ ...p })) : [],
    enabled: skill.enabled !== false,
  });

  function set(key, val) {
    setDraft((prev) => ({ ...prev, [key]: val }));
  }

  function addParam() {
    setDraft((prev) => ({
      ...prev,
      params: [...prev.params, { name: '', type: 'string', description: '', required: false }],
    }));
  }

  function updateParam(i, p) {
    setDraft((prev) => {
      const params = [...prev.params];
      params[i] = p;
      return { ...prev, params };
    });
  }

  function removeParam(i) {
    setDraft((prev) => ({ ...prev, params: prev.params.filter((_, idx) => idx !== i) }));
  }

  const isValid = draft.name.trim() && draft.systemPrompt.trim();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
      {/* Name + enabled */}
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nombre</label>
          <input
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Nombre de la skill"
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
          placeholder="Breve descripción de cuándo se usa"
          className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition"
        />
      </div>

      {/* Trigger */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Activación</label>
          <select
            value={draft.trigger}
            onChange={(e) => set('trigger', e.target.value)}
            className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition bg-white"
          >
            {Object.entries(TRIGGER_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        {(draft.trigger === 'keyword' || draft.trigger === 'intent') && (
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {draft.trigger === 'keyword' ? 'Palabras clave (coma)' : 'Frases de intención'}
            </label>
            <input
              value={draft.triggerValue}
              onChange={(e) => set('triggerValue', e.target.value)}
              placeholder={draft.trigger === 'keyword' ? 'hola, hi, buenas' : 'quiero info, me interesa'}
              className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition"
            />
          </div>
        )}
      </div>

      {/* System prompt */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">System Prompt</label>
          <span className="text-[10px] text-slate-400">{draft.systemPrompt.length} caracteres</span>
        </div>
        <textarea
          rows={6}
          value={draft.systemPrompt}
          onChange={(e) => set('systemPrompt', e.target.value)}
          placeholder="Instrucciones que seguirá el bot cuando se active esta skill…"
          className="w-full resize-y border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm leading-relaxed outline-none transition"
        />
      </div>

      {/* Params */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Parámetros</label>
          <button onClick={addParam} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition">
            + Agregar
          </button>
        </div>
        {draft.params.length === 0 ? (
          <p className="text-xs text-slate-400">Sin parámetros.</p>
        ) : (
          <div className="space-y-2">
            {draft.params.map((p, i) => (
              <div key={i} className="grid grid-cols-[1fr_90px_2fr_55px_28px] items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <input value={p.name} onChange={(e) => updateParam(i, { ...p, name: e.target.value })} placeholder="nombre" className="bg-transparent text-sm outline-none" />
                <select value={p.type} onChange={(e) => updateParam(i, { ...p, type: e.target.value })} className="bg-transparent text-sm outline-none">
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                </select>
                <input value={p.description} onChange={(e) => updateParam(i, { ...p, description: e.target.value })} placeholder="descripción" className="bg-transparent text-sm outline-none" />
                <button onClick={() => updateParam(i, { ...p, required: !p.required })} className={`text-xs font-medium rounded px-1.5 py-0.5 ${p.required ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-500'}`}>
                  {p.required ? 'req.' : 'opt.'}
                </button>
                <button onClick={() => removeParam(i)} className="text-slate-400 hover:text-red-500 text-base leading-none">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button onClick={onCancel} className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition">
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

// ─── Skill card ───────────────────────────────────────────────────────────────

function SkillCard({ skill, onEdit, onDelete, onToggle, deleting }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-opacity ${!skill.enabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-base shrink-0">⚡</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 truncate">{skill.name}</span>
            <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${TRIGGER_COLORS[skill.trigger] || 'bg-slate-100 text-slate-500'}`}>
              {TRIGGER_LABELS[skill.trigger] || skill.trigger}
            </span>
            {!skill.enabled && <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-slate-100 text-slate-400">Inactiva</span>}
          </div>
          {skill.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{skill.description}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onToggle} title={skill.enabled ? 'Deshabilitar' : 'Habilitar'} className={`text-sm px-2 py-1.5 rounded-lg transition hover:bg-slate-100 ${skill.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>✓</button>
          <button onClick={onEdit} className="text-sm px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">✎</button>
          <button onClick={onDelete} disabled={deleting} className="text-sm px-2 py-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40">
            {deleting ? '…' : '🗑'}
          </button>
          <button onClick={() => setExpanded((v) => !v)} className="text-sm px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-slate-100 px-5 pb-4 pt-3 space-y-3">
          {skill.trigger_value && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {skill.trigger === 'keyword' ? 'Palabras clave' : 'Frases'}
              </span>
              <p className="mt-1 text-xs text-slate-600">{skill.trigger_value}</p>
            </div>
          )}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">System Prompt</span>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-4">{skill.system_prompt}</p>
          </div>
          {skill.params && skill.params.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Parámetros ({skill.params.length})</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {skill.params.map((p, i) => (
                  <span key={i} className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | { skill, isNew }
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listSkills(true);
      setSkills(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => setEditing({ skill: emptySkill(), isNew: true });
  const cancelEdit = () => setEditing(null);

  const handleSave = async (draft) => {
    setSaving(true);
    try {
      if (editing.isNew) {
        await createSkill(draft);
      } else {
        await updateSkill(editing.skill.id, draft);
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
    if (!window.confirm('¿Eliminar esta skill?')) return;
    setDeletingId(id);
    try {
      await deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (skill) => {
    try {
      await updateSkill(skill.id, { enabled: !skill.enabled });
      setSkills((prev) => prev.map((s) => s.id === skill.id ? { ...s, enabled: !s.enabled } : s));
    } catch (err) {
      setError(err.message);
    }
  };

  const activeCount = skills.filter((s) => s.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Skills</h1>
          <p className="text-sm text-slate-500 mt-0.5">Habilidades que usa Missy al responder</p>
        </div>
        <button
          onClick={startNew}
          disabled={!!editing}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Nueva skill
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Skills totales', value: skills.length, color: 'text-slate-800' },
          { label: 'Habilitadas', value: activeCount, color: 'text-emerald-600' },
          { label: 'Deshabilitadas', value: skills.length - activeCount, color: 'text-amber-600' },
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
            ⚠ {editing.isNew ? 'Creando nueva skill' : `Editando: ${editing.skill.name || 'sin nombre'}`}
          </p>
          <SkillEditor skill={editing.skill} onSave={handleSave} onCancel={cancelEdit} saving={saving} />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : skills.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-4xl">⚡</div>
          <div>
            <p className="font-semibold text-slate-700">No hay skills definidas</p>
            <p className="text-sm text-slate-400 mt-1">Crea la primera skill para que Missy sepa cómo responder</p>
          </div>
          <button onClick={startNew} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
            + Crear primera skill
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
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
