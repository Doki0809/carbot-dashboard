export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-3">
      <span className="text-base">⚠️</span>
      <div className="flex-1">
        <p>{message || 'Ocurrió un error inesperado.'}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
