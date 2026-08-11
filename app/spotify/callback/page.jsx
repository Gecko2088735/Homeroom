'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeAuth } from 'lib/spotify';

export default function SpotifyCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState('working');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        if (error || !code) {
            // window.location.search is only available client-side, so this whole check
            // (and the resulting setState) can only happen post-mount, not during render.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStatus('error');
            return;
        }
        completeAuth(code, state)
            .then(() => router.replace('/focus'))
            .catch(() => setStatus('error'));
    }, [router]);

    return (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
            {status === 'working' && <p className="text-muted">Connecting to Spotify…</p>}
            {status === 'error' && (
                <>
                    <p className="text-danger">Something went wrong connecting to Spotify.</p>
                    <a href="/focus" className="btn">
                        Back to Focus
                    </a>
                </>
            )}
        </div>
    );
}
