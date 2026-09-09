import { useToast } from '../contexts/ToastContext';

export function ToastList() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div className="toast-list" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
          <span>{toast.message}</span>
          <button type="button" className="toast__close" onClick={() => dismiss(toast.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
