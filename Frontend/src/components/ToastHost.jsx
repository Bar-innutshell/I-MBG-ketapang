import React, { useEffect, useState } from 'react';

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const onAdd = (e) => {
      const t = e.detail;
      setToasts((list) => [...list, t]);
      if (t.duration > 0) {
        setTimeout(() => {
          setToasts((list) => list.filter(x => x.id !== t.id));
        }, t.duration);
      }
    };
    const onRemove = (e) => {
      const { id } = e.detail || {};
      setToasts((list) => list.filter(x => x.id !== id));
    };
    window.addEventListener('toast:add', onAdd);
    window.addEventListener('toast:remove', onRemove);
    return () => {
      window.removeEventListener('toast:add', onAdd);
      window.removeEventListener('toast:remove', onRemove);
    };
  }, []);

  const color = (type) =>
    type === 'success' ? 'border-emerald-500'
    : type === 'error' ? 'border-rose-500'
    : 'border-sky-500';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`min-w-[240px] max-w-[360px] border-l-4 ${color(t.type)} rounded-md bg-card shadow-lg`}>
          <div className="px-3 py-2 text-sm flex items-start gap-2">
            <span className="mt-0.5">🔔</span>
            <div className="flex-1">{t.message}</div>
            <button
              onClick={() => setToasts(list => list.filter(x => x.id !== t.id))}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}