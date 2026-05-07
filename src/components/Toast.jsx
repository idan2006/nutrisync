import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

/**
 * Auto-dismissing toast notification.
 * Props:
 *   message  – string
 *   type     – 'success' | 'error'
 *   onClose  – called when dismissed
 */
export default function Toast({ message, type = 'success', onClose }) {
  const [leaving, setLeaving] = useState(false);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(onClose, 250);
  };

  useEffect(() => {
    const t = setTimeout(dismiss, 3500);
    return () => clearTimeout(t);
  }, []);

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed bottom-28 left-1/2 z-[200] flex items-center gap-3 px-4 py-3.5
        rounded-2xl shadow-2xl max-w-[calc(100vw-2rem)] w-max
        ${isSuccess ? 'bg-gray-900' : 'bg-red-600'}
        ${leaving ? 'toast-leave' : 'toast-enter'}`}
      style={{ transform: 'translateX(-50%)' }}
    >
      {isSuccess
        ? <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
        : <XCircle     size={18} className="text-white flex-shrink-0" />
      }
      <span className="text-white text-sm font-medium whitespace-nowrap">{message}</span>
      <button onClick={dismiss} className="ml-1 text-white/60 hover:text-white transition">
        <X size={14} />
      </button>
    </div>
  );
}
