import { useState, useEffect, useCallback } from 'react';
import {
  listGlobalKnowledge, getGlobalKnowledgeEntry,
  createGlobalKnowledge, updateGlobalKnowledge, deleteGlobalKnowledge,
} from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

/* ── Constants ───────────────────────────────────────────────────────────── */
const SOURCE_TYPES = ['text', 'pdf', 'table', 'scraping', 'url'];
const SOURCE_STYLES = {
  text:     { bg: 'rgba(79,120,255,0.12)', color: '#818cf8',  border: 'rgba(79,120,255,0.25)' },
  pdf:      { bg: 'rgba(230,48,48,0.12)',  color: '#ff8080',  border: 'rgba(230,48,48,0.25)' },
  table:    { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa',  border: 'rgba(139,92,246,0.25)' },
  scraping: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24',  border: 'rgba(245,158,11,0.20)' },
  url:      { bg: 'rgba(6,182,212,0.12)',  color: '#22d3ee',  border: 'rgba(6,182,212,0.20)' },
};

function emptyEntry() {
  return { title: '', content: '', source_type: 'text', source_url: '', tags: '' };
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

/* ── Entry editor ─────────────────────────────────────────────────────────── */
function EntryEditor({ entry, onSave, onCancel, saving }) {
  const [draft, setDraft] = useState({
    title:       entry.title       || '',
    content:     entry.content     || '',
    source_type: entry.source_type || 'text',
    source_url:  entry.source_url  || '',
    tags:        Array.isArray(entry.tags) ? entry.tags.join(', ') : (entry.tags || ''),
  });

  const set     = (k, v) => setDraft(prev => ({ ...prev, [k]: v }));
  const isValid = draft.title.trim() && draft.content.trim();

  function handleSave() {
    const tags = draft.tags.split(',').map(t => t.trim()).filter(Boolean);
    onSave({ ...draft, tags, source_url: draft.source_url || null });
  }

  const inputCls = 'input-dark w-full rounded-xl px-3 py-2.5 text-sm';

  return (
    <div className="p-6 space-y-5 float-in" style={{ background: '#0e1015', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.03)' }}>
      {/* Title */}
      <div>
        <FieldLabel>Título</FieldLabel>
        <input value={draft.title} onChange={e => set('title', e.target.value)}
          placeholder="Nombre de la entrada" className={inputCls} />
      </div>

      {/* Source type + URL */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Tipo de fuente</FieldLabel>
          <select value={draft.source_type} onChange={e => set('source_type', e.target.value)}
            className="select-dark w-full rounded-xl px-3 py-2.5 text-sm">
            {SOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>URL fuente (opcional)</FieldLabel>
          <input value={draft.source_url} onChange={e => set('source_url', e.target.value)}
            placeholder="https://…" className={inputCls} />
        </div>
      </div>

      {/* Tags */}
      <div>
        <FieldLabel>Tags (separados por coma)</FieldLabel>
        <input value={draft.tags} onChange={e => set('tags', e.target.value)}
          placeholder="identity, precios, horarios" className={inputCls} />
        <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Usa el tag <span className="font-mono px-1 rounded" style={{ background: 'rgba(230,48,48,0.12)', color: '#e63030' }}>identity</span> para que esta entrada siempre esté disponible.
        </p>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>Contenido</FieldLabel>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{draft.content.length} caracteres</span>
        </div>
        <textarea rows={8} value={draft.content} onChange={e => set('content', e.target.value)}
          placeholder="Escribe aquí el conocimiento que el bot debe usar…"
          className="textarea-dark w-full rounded-xl px-3 py-2.5 text-sm leading-relaxed" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onCancel} className="btn-ghost px-4 py-2 rounded-xl text-sm font-medium">Cancelar</button>
        <button onClick={handleSave} disabled={!isValid || saving}
          className="btn-red flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold">
          {saving ? <Spinner size="sm" /> : null} Guardar
        </button>
      </div>
    </div>
  );
}

/* ── Entry card ───────────────────────────────────────────────────────────── */
function EntryCard({ entry, onEdit, onDelete, deleting }) {
  const [expanded, setExpanded] = useState(false);
  const sStyle = SOURCE_STYLES[entry.source_type] || { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.10)' };
  
  const iconSvg = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  );

  return (
    <div className="overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] group relative" 
         style={{ background: '#0e1015', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.03)', opacity: entry.is_active ? 1 : 0.45 }}>
      
      {/* 3D Radial Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
           style={{ background: `radial-gradient(circle at 10% 50%, ${sStyle.color}15 0%, transparent 60%)` }} />
      
      {/* Watermark SVG */}
      <div className="absolute -bottom-8 -right-8 pointer-events-none opacity-5 group-hover:opacity-20 group-hover:rotate-12 group-hover:scale-125 transition-all duration-1000 ease-out" style={{ color: sStyle.color }}>
        <div style={{ transform: 'scale(4)' }}>{iconSvg}</div>
      </div>

      <div className="flex items-center gap-5 px-6 py-5 relative z-10">
        
        {/* Colossal Icon Box */}
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:-translate-y-1"
          style={{ background: sStyle.bg, border: `1px solid ${sStyle.border}`, color: sStyle.color, boxShadow: `0 10px 30px -10px ${sStyle.color}40` }}>
          <div className="w-6 h-6">{iconSvg}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <span className="text-xl font-bold truncate transition-colors duration-300 group-hover:text-white" style={{ color: 'rgba(255,255,255,0.85)' }}>{entry.title}</span>
            <span className="text-[10px] uppercase font-black tracking-widest rounded-full px-2.5 py-0.5"
              style={{ background: sStyle.bg, color: sStyle.color, border: `1px solid ${sStyle.border}` }}>
              {entry.source_type}
            </span>
            {!entry.is_active && (
              <span className="text-[10px] rounded-full px-2 py-0.5"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.30)' }}>Inactiva</span>
            )}
          </div>
          {entry.tags?.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {entry.tags.map(tag => (
                <span key={tag} className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: tag === 'identity' ? 'rgba(230,48,48,0.12)' : 'rgba(255,255,255,0.05)',
                    color: tag === 'identity' ? '#e63030' : 'rgba(255,255,255,0.40)',
                    border: tag === 'identity' ? '1px solid rgba(230,48,48,0.20)' : '1px solid rgba(255,255,255,0.07)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { onClick: onEdit,   icon: <IconEdit />,   title: 'Editar' },
            { onClick: onDelete, icon: deleting ? '…' : <IconTrash />, title: 'Eliminar', danger: true, disabled: deleting },
            { onClick: () => setExpanded(v => !v), icon: <IconChevron open={expanded} />, title: 'Expandir' },
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick} disabled={btn.disabled} title={btn.title}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all disabled:opacity-40"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.background = btn.danger ? 'rgba(230,48,48,0.15)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = btn.danger ? '#ff8080' : 'rgba(255,255,255,0.9)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 pt-3 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {entry.source_url && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>Fuente</p>
              <p className="text-xs truncate" style={{ color: '#22d3ee' }}>{entry.source_url}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>Contenido</p>
            <p className="text-xs leading-relaxed line-clamp-6 whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.55)' }}>{entry.content}</p>
          </div>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Creado: {new Date(entry.created_at).toLocaleString('es-MX')}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function KnowledgeBase() {
  const [entries,    setEntries]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [editing,    setEditing]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try   { setEntries(await listGlobalKnowledge()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (draft) => {
    setSaving(true);
    try {
      editing.isNew ? await createGlobalKnowledge(draft) : await updateGlobalKnowledge(editing.entry.id, draft);
      setEditing(null); await load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleEdit = async (entry) => {
    try { setEditing({ entry: await getGlobalKnowledgeEntry(entry.id), isNew: false }); }
    catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta entrada de la base de conocimiento?')) return;
    setDeletingId(id);
    try { await deleteGlobalKnowledge(id); setEntries(prev => prev.filter(e => e.id !== id)); }
    catch (err) { setError(err.message); }
    finally { setDeletingId(null); }
  };

  const activeCount = entries.filter(e => e.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between float-in">
        <div>
          <h1 className="text-3xl font-[900] tracking-tighter" style={{ color: 'rgba(255,255,255,0.95)' }}>Base de conocimiento</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Información global que Missy consume al responder</p>
        </div>
        <button onClick={() => setEditing({ entry: emptyEntry(), isNew: true })} disabled={!!editing}
          className="btn-red flex items-center gap-2 px-5 py-3 rounded-2xl text-xs uppercase tracking-wider font-bold transition-transform hover:scale-105 shadow-[0_10px_20px_rgba(230,48,48,0.3)] disabled:opacity-40 disabled:hover:scale-100">
          <IconPlus /> Nueva entrada
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 float-in stagger-1">
        {[
          { label: 'Entradas totales', value: entries.length,                accent: '#3b82f6', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> },
          { label: 'Activas',          value: activeCount,                   accent: '#10b981', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: 'Inactivas',        value: entries.length - activeCount,  accent: '#f59e0b', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> },
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

      {/* Info banner */}
      <div className="px-6 py-5 text-sm float-in stagger-2 relative overflow-hidden group hover:shadow-[0_15px_30px_rgba(79,120,255,0.15)] transition-all duration-500"
        style={{ background: '#0e1015', borderRadius: '1.5rem', border: '1px solid rgba(79,120,255,0.15)' }}>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: 'radial-gradient(circle at 10% 50%, rgba(79,120,255,0.1) 0%, transparent 50%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner" style={{ background: 'rgba(79,120,255,0.12)', color: '#818cf8', border: '1px solid rgba(79,120,255,0.25)', boxShadow: '0 0 20px rgba(79,120,255,0.15)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.60)' }} className="leading-relaxed">
            <strong style={{ color: 'rgba(255,255,255,0.90)' }} className="text-base">¿Cómo funciona?</strong><br/>
            El bot busca automáticamente en esta base para cada mensaje e inyecta el contexto más relevante.
            Usa el tag <span className="font-mono px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ml-1" style={{ background: 'rgba(230,48,48,0.12)', color: '#e63030', border: '1px solid rgba(230,48,48,0.2)' }}>identity</span> en entradas que deben estar completamente fijas en su memoria base.
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={load} />}

      {editing && (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: '#f59e0b' }}>
            {editing.isNew ? 'Creando nueva entrada' : `Editando: ${editing.entry.title || 'sin título'}`}
          </p>
          <EntryEditor entry={editing.entry} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center float-in" style={{ background: '#0e1015', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(79,120,255,0.10)', border: '1px solid rgba(79,120,255,0.18)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>No hay entradas en la base de conocimiento</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Agrega información para que Missy pueda responder con contexto</p>
          </div>
          <button onClick={() => setEditing({ entry: emptyEntry(), isNew: true })}
            className="btn-red flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
            <IconPlus /> Crear primera entrada
          </button>
        </div>
      ) : (
        <div className="space-y-3 float-in stagger-3">
          {entries.map(entry => (
            <EntryCard key={entry.id} entry={entry}
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
