import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import type { Toast } from '@/hooks/useToast';

const ICONS = {
  success: <CheckCircle size={19} color="var(--green)" style={{ marginTop: 1, flex: 'none' }} />,
  error:   <AlertCircle size={19} color="var(--neg)"   style={{ marginTop: 1, flex: 'none' }} />,
  info:    <Info        size={19} color="var(--blue)"  style={{ marginTop: 1, flex: 'none' }} />,
};

interface Props {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export function Toaster({ toasts, onRemove }: Props) {
  if (!toasts.length) return null;
  return (
    <div className="fh-toaster">
      {toasts.map(t => (
        <div key={t.id} className={`fh-toast${t.tone === 'error' ? ' error' : t.tone === 'info' ? ' info' : ''}`}>
          {ICONS[t.tone]}
          <div style={{ flex: 1 }}>
            <div className="fh-toast-title">{t.title}</div>
            {t.message && <div className="fh-toast-msg">{t.message}</div>}
          </div>
          <button
            onClick={() => onRemove(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--ink-3)' }}
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
