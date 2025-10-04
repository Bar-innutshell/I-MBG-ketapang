import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

/** Toggle tema via class 'dark' di <html> */
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  );

  useEffect(() => {
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
    const enableDark = !isDark;
    setIsDark(enableDark);
    document.documentElement.classList.toggle('dark', enableDark);
    try {
      localStorage.setItem('theme', enableDark ? 'dark' : 'light');
    } catch (_) {}
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 border border-default hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-foreground"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      title={isDark ? 'Switch to Light' : 'Switch to Dark'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
