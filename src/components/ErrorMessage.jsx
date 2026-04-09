const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div
      className="rounded-xl p-4 text-sm flex items-start gap-3"
      style={{
        background: 'rgba(230,48,48,0.08)',
        border: '1px solid rgba(230,48,48,0.25)',
        color: '#ff8080',
      }}
    >
      <span className="shrink-0 mt-0.5" style={{ color: '#e63030' }}>
        <IconWarning />
      </span>
      <div className="flex-1">
        <p>{message || 'Ocurrió un error inesperado.'}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-medium transition-colors"
            style={{ color: '#e63030', textDecoration: 'underline' }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'none'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'underline'}
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
