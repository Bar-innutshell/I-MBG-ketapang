import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Apple, BookOpen, Home, Soup, Sun, Moon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navbarItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Artikel', href: '/artikel', icon: BookOpen },
    { label: 'Resep', href: '/resep', icon: Soup },
    { label: 'Asupan', href: '/asupan-harian', icon: Sun},
];

const Navbar = () => {
    const { pathname } = useLocation();
    return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-md bg-white/40 dark:bg-slate-900/40 supports-[backdrop-filter]:bg-white/25 dark:supports-[backdrop-filter]:bg-slate-900/25 border-b border-black/5 dark:border-white/5">
            <nav className="mx-auto max-w-6xl px-4">
                <div className="h-16 flex items-center justify-between">
                    <Link to="/" className="inline-flex items-center gap-2 font-bold">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            <Apple size={18} />
                        </span>
                        <span>I-MBG</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <nav className="flex items-center gap-4">
                            <NavLink to="/" className={({isActive}) => isActive ? 'font-semibold' : ''}>Home</NavLink>
                            <NavLink to="/artikel" className={({isActive}) => isActive ? 'font-semibold' : ''}>Artikel</NavLink>
                            <NavLink to="/resep" className={({isActive}) => isActive ? 'font-semibold' : ''}>Resep</NavLink>
                            <NavLink to="/asupan-harian" className={({isActive}) => isActive ? 'font-semibold text-emerald-500' : ''}>Asupan</NavLink>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;