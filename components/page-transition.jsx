'use client';

import { usePathname } from 'next/navigation';

// Remounting the wrapper on every route change (via key={pathname}) replays the CSS entrance
// animation, since `animation` — unlike `transition` — only plays on an element's initial paint.
export function PageTransition({ children }) {
    const pathname = usePathname();
    return (
        <div key={pathname} className="page-fade-in">
            {children}
        </div>
    );
}
