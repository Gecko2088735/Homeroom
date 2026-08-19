'use client';

import { useState } from 'react';

export function CopyDiscordButton({ username, icon: Icon }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(username);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    if (Icon) {
        return (
            <button
                type="button"
                onClick={handleCopy}
                title={copied ? 'Copied!' : `Copy ${username}`}
                className="flex items-center justify-center w-14 h-14 transition rounded-full bg-neutral-900 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:bg-neutral-800 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]"
            >
                <Icon className="w-6 h-6 text-white" />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-bold text-black transition bg-white rounded-full hover:bg-neutral-200 shrink-0"
        >
            {copied ? 'Copied!' : 'Copy username'}
        </button>
    );
}
