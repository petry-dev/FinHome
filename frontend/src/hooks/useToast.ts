import { useState, useCallback } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  message?: string;
}

let _push: ((t: Toast) => void) | null = null;

export function toast(opts: Omit<Toast, 'id'> | string) {
  if (!_push) return;
  const payload = typeof opts === 'string' ? { tone: 'success' as ToastTone, title: opts } : opts;
  _push({ id: Date.now() + Math.random(), ...payload });
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Toast) => {
    setToasts(prev => [...prev, t]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3800);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  }, []);

  // register global handle
  _push = push;

  return { toasts, removeToast };
}
