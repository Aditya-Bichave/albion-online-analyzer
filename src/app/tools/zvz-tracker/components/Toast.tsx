'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    error: <XCircle className="h-5 w-5 text-destructive" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
    info: <Info className="h-5 w-5 text-info" />
  };

  const bgColors = {
    success: 'bg-success/10 border-success/20',
    error: 'bg-destructive/10 border-destructive/20',
    warning: 'bg-warning/10 border-warning/20',
    info: 'bg-info/10 border-info/20'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in">
      <div className={`${bgColors[type]} border px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 min-w-[300px]`}>
        {icons[type]}
        <p className="text-foreground flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Toast manager hook
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return {
    toasts,
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    warning: (msg: string) => addToast(msg, 'warning'),
    info: (msg: string) => addToast(msg, 'info'),
    remove: removeToast
  };
}

// Toast container component
export function ToastContainer({ toasts, remove }: { toasts: Array<{ id: string; message: string; type: ToastType }>; remove: (id: string) => void }) {
  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => remove(toast.id)}
        />
      ))}
    </>
  );
}
