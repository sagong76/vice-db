import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
}

export function Modal({ open, onClose, children, title, maxWidth = 'max-w-3xl' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close"
        role="button"
        tabIndex={-1}
      />
      <div
        className={`relative my-8 w-full ${maxWidth} rounded-2xl border border-ink-600 bg-ink-800 shadow-card animate-scaleIn`}
      >
        {title !== undefined && (
          <div className="flex items-center justify-between border-b border-ink-700 px-6 py-4">
            <h2 className="font-display text-lg font-semibold tracking-wide text-white">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-200 transition hover:bg-ink-700 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
