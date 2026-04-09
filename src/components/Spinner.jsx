export default function Spinner({ size = 'md' }) {
  const dims =
    size === 'sm' ? { w: 16, h: 16, border: 2 } :
    size === 'lg' ? { w: 40, h: 40, border: 3 } :
                   { w: 24, h: 24, border: 2 };

  return (
    <svg
      width={dims.w}
      height={dims.h}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Cargando"
      style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="12" cy="12" r="10"
        stroke="rgba(230,48,48,0.15)"
        strokeWidth={dims.border + 1}
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#e63030"
        strokeWidth={dims.border + 1}
        strokeLinecap="round"
      />
    </svg>
  );
}
