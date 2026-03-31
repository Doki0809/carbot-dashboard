export default function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4 border-2' : size === 'lg' ? 'w-10 h-10 border-4' : 'w-6 h-6 border-2';
  return (
    <div
      className={`${s} rounded-full border-slate-200 border-t-brand-600 animate-spin`}
      role="status"
      aria-label="Cargando"
    />
  );
}
