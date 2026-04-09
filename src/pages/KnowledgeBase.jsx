import { useState, useEffect, useCallback } from 'react';
import {
  listGlobalKnowledge,
  getGlobalKnowledgeEntry,
  createGlobalKnowledge,
  updateGlobalKnowledge,
  deleteGlobalKnowledge,
} from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const SOURCE_TYPES = ['text', 'pdf', 'table', 'scraping', 'url'];

const SOURCE_COLORS = {
  text: 'bg-blue-100 text-blue-700',
  pdf: 'bg-red-100 text-red-700',
  table: 'bg-purple-100 text-purple-700',
  scraping: 'bg-amber-100 text-amber-700',
  url: 'bg-cyan-100 text-cyan-700',
};

function emptyEntry() {
  return { title: '', content: '', source_type: 'text', source_url: '', tags: '' };
}

// ─── Editor ───────────────────────────────────────────────────────────────────

function EntryEditor({ entry, onSave, onCancel, saving }) {
  const [draft, setDraft] = useState({
    title: entry.title || '',
    content: entry.content || '',
    source_type: entry.source_type || 'text',
    source_url: entry.source_url || '',
    tags: Array.isArray(entry.tags) ? entry.tags.join(', ') : (entry.tags || ''),
  });

  function set(key, val) {
    setDraft((prev) => ({ ...prev, [key]: val }));
  }

  function handleSave() {
    const tags = draft.tags.split(',').map((t) => t.trim()).filter(Boolean);
    onSave({ ...draft, tags, source_url: draft.source_url || null });
  }

  const isValid = draft.title.trim() && draft.content.trim();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Título</label>
        <input
          value={draft.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Nombre de la entrada"
          className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tipo de fuente</label>
          <select
            value={draft.source_type}
            onChange={(e) => set('source_type', e.target.value)}
            className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition bg-white"
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">URL fuente (opcional)</label>
          <input
            value={draft.source_url}
            onChange={(e) => set('source_url', e.target.value)}
            placeholder="https://..."
            className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tags (separados por coma)</label>
        <input
          value={draft.tags}
          onChange={(e) => set('tags', e.target.value)}
          placeholder="identity, precios, horarios"
          className="w-full border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm outline-none transition"
        />
        <p className="text-[10px] text-slate-400">
          Usa el tag <code className="bg-slate-100 px-1 rounded">identity</code> para que esta entrada siempre esté disponible para el bot.
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Contenido</label>
          <span className="text-[10px] text-slate-400">{draft.content.length} caracteres</span>
        </div>
        <textarea
          rows={8}
          value={draft.content}
          onChange={(e) => set('content', e.target.value)}
          placeholder="Escribe aquí el conocimiento que el bot debe usar…"
          className="w-full resize-y border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-2.5 text-sm leading-relaxed outline-none transition"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button onClick={onCancel} className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition">
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? <Spinner size="sm" /> : '💾'} Guardar
        </button>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function EntryCard({ entry, onEdit, onDelete, deleting }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden ${!entry.is_active ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-base shrink-0">📚</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 truncate">{entry.title}</span>
            <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${SOURCE_COLORS[entry.source_type] || 'bg-slate-100 text-slate-500'}`}>
              {entry.source_type}
            </span>
            {!entry.is_active && <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-slate-100 text-slate-400">Inactiva</span>}
          </div>
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {entry.tags.map((tag) => (
                <span key={tag} className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
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
          {entry.source_url && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Fuente</span>
              <p className="mt-1 text-xs text-blue-600 truncate">{entry.source_url}</p>
            </div>
          )}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Contenido</span>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-6 whitespace-pre-wrap">{entry.content}</p>
          </div>
          <p className="text-[10px] text-slate-400">
            Creado: {new Date(entry.created_at).toLocaleString('es-MX')}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KnowledgeBase() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listGlobalKnowledge(true);
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => setEditing({ entry: emptyEntry(), isNew: true });
  const cancelEdit = () => setEditing(null);

  const handleSave = async (draft) => {
    setSaving(true);
    try {
      if (editing.isNew) {
        await createGlobalKnowledge(draft);
      } else {
        await updateGlobalKnowledge(editing.entry.id, draft);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (entry) => {
    try {
      const full = await getGlobalKnowledgeEntry(entry.id);
      setEditing({ entry: full, isNew: false });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta entrada de la base de conocimiento?')) return;
    setDeletingId(id);
    try {
      await deleteGlobalKnowledge(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const activeCount = entries.filter((e) => e.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Base de conocimiento</h1>
          <p className="text-sm text-slate-500 mt-0.5">Información global que Missy usa al responder</p>
        </div>
        <button
          onClick={startNew}
          disabled={!!editing}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Nueva entrada
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Entradas totales', value: entries.length, color: 'text-slate-800' },
          { label: 'Activas', value: activeCount, color: 'text-emerald-600' },
          { label: 'Inactivas', value: entries.length - activeCount, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 text-sm text-blue-700">
        <strong>¿Cómo funciona?</strong> El bot busca automáticamente en esta base para cada mensaje e inyecta el contexto más relevante en su prompt. Usa el tag <code className="bg-blue-100 px-1 rounded text-xs">identity</code> en entradas que deben estar siempre disponibles (ej. descripción del negocio, horarios).
      </div>

      {error && <ErrorMessage message={error} onRetry={load} />}

      {editing && (
        <div>
          <p className="text-sm font-medium text-amber-600 mb-3">
            ⚠ {editing.isNew ? 'Creando nueva entrada' : `Editando: ${editing.entry.title || 'sin título'}`}
          </p>
          <EntryEditor entry={editing.entry} onSave={handleSave} onCancel={cancelEdit} saving={saving} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : entries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-4xl">📚</div>
          <div>
            <p className="font-semibold text-slate-700">No hay entradas en la base de conocimiento</p>
            <p className="text-sm text-slate-400 mt-1">Agrega información para que Missy pueda responder con contexto</p>
          </div>
          <button onClick={startNew} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
            + Crear primera entrada
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={() => handleEdit(entry)}
              onDelete={() => handleDelete(entry.id)}
              deleting={deletingId === entry.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
