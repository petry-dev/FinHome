import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

export function Modal({ isOpen, title, onClose, children, maxWidth }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fh-overlay" onMouseDown={onClose}>
      <div
        className="fh-modal"
        style={maxWidth ? { maxWidth } : undefined}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="fh-modal-head">
          <div className="fh-modal-title">{title}</div>
          <button
            className="fh-btn fh-btn-ghost fh-btn-icon"
            style={{ marginLeft: 'auto' }}
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} color="var(--ink-2)" />
          </button>
        </div>
        <div className="fh-modal-body">{children}</div>
      </div>
    </div>
  );
}
