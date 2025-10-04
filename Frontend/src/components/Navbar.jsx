import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Apple, BookOpen, Home, Soup, Sun, Moon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { getTodayItems, subscribe } from '../lib/intakeStore';

const navbarItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Artikel', href: '/artikel', icon: BookOpen },
    { label: 'Resep', href: '/resep', icon: Soup },
    { label: 'Asupan', href: '/asupan-harian', icon: Sun},
];

const Navbar = () => {
    const { pathname } = useLocation();
    const [intakeCount, setIntakeCount] = useState(getTodayItems().length);

    useEffect(() => {
        const unsub = subscribe(() => setIntakeCount(getTodayItems().length));
        // in case SSR/HMR
        setIntakeCount(getTodayItems().length);
        return unsub;
    }, []);

    return (
        <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-slate-900/50 border-b border-black/5 dark:border-white/5">
            <nav className="mx-auto max-w-6xl px-4">
                <div className="h-16 flex items-center justify-between">
                    <Link to="/" className="inline-flex items-center gap-2 font-bold">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            <Apple size={18} />
                        </span>
                        <span>I-MBG</span>
                    </Link>

                    <ul className="hidden md:flex items-center gap-2 text-sm">
                        {navbarItems.map(({ href, label, icon: Icon }) => {
                            const active = pathname === href;
                            return (
                                <li key={href}>
                                    <Link
                                        to={href}
                                        className={
                                            `inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ` +
                                            (active
                                                // aktif: hijau jelas di kedua mode
                                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                                // non-aktif: jauh lebih terbaca di light mode
                                                : 'text-slate-700 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5'
                                            )
                                        }
                                    >
                                        <Icon size={16} />
                                        {label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
