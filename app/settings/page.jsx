'use client';

import { ThemeToggle } from 'components/theme-toggle';

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1>Settings</h1>
            <section className="flex items-center justify-between gap-4 p-5 border rounded-xl border-edge bg-surface">
                <div>
                    <h3>Theme</h3>
                    <p className="text-sm text-muted">Switch between the light and dark look.</p>
                </div>
                <ThemeToggle />
            </section>
        </div>
    );
}
