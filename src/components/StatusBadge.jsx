export default function StatusBadge({ status }) {
  const active = status === 'active';
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full"
      style={active ? {
        background: 'rgba(16,185,129,0.12)',
        border: '1px solid rgba(16,185,129,0.25)',
        color: '#34d399',
      } : {
        background: 'rgba(245,158,11,0.12)',
        border: '1px solid rgba(245,158,11,0.20)',
        color: '#fbbf24',
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? 'animate-pulse' : ''}`}
        style={{ background: active ? '#10b981' : '#f59e0b', boxShadow: active ? '0 0 4px rgba(16,185,129,0.6)' : 'none' }}
      />
      {active ? 'Activo' : 'Pausado'}
    </span>
  );
}
