export function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="spinner" role="status" aria-live="polite">
      <span className="spinner__circle" />
      <span className="spinner__label">{label}</span>
    </div>
  );
}
