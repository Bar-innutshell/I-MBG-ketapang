import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

// Minimal theme toggle using HTML class 'dark' on <html>
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  useEffect(() => {
    // Keep state in sync if theme is changed in another tab or by other code
    const onStorage = (e) => {
      if (e.key === 'theme') {
        const enableDark = e.newValue === 'dark';
        setIsDark(enableDark);
        document.documentElement.classList.toggle('dark', enableDark);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      title={isDark ? 'Switch to Light' : 'Switch to Dark'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
