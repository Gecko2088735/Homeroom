'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';

const navItems = [
    { linkText: 'Home', href: '/' },
    { linkText: 'Calendar', href: '/calendar' },
    { linkText: 'Homework', href: '/homework' },
    { linkText: 'Classes', href: '/classes' },
    { linkText: 'Settings', href: '/settings' }
];

export function Header() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-wrap items-center gap-2 pt-6 pb-8 sm:gap-4 sm:pb-12">
            <Link href="/" className="text-xl font-black tracking-tight text-accent no-underline">
                Homeroom
            </Link>
            <ul className="flex flex-wrap items-center gap-x-1 gap-y-1 ml-auto sm:gap-x-2">
                {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={[
                                    'inline-flex items-center px-3 py-2 min-h-11 rounded-lg text-sm font-medium no-underline transition-colors',
                                    active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-hover hover:text-foreground'
                                ].join(' ')}
                            >
                                {item.linkText}
                            </Link>
                        </li>
                    );
                })}
            </ul>
            <ThemeToggle />
        </nav>
    );
}
