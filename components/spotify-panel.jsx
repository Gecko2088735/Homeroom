'use client';

import { useEffect, useState } from 'react';
import { Alert } from './alert';
import {
    beginAuth,
    disconnect,
    getCurrentlyPlaying,
    isConfigured,
    isConnected,
    playPause,
    skipNext
} from 'lib/spotify';

const POLL_MS = 10000;

export function SpotifyPanel() {
    const [connected, setConnected] = useState(false);
    const [ready, setReady] = useState(false);
    const [track, setTrack] = useState(null);
    const [controlError, setControlError] = useState('');

    useEffect(() => {
        // Whether we're connected lives in localStorage, unavailable during SSR/prerender,
        // so it has to be read client-side after mount rather than in a useState initializer.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConnected(isConnected());
        setReady(true);
    }, []);

    useEffect(() => {
        if (!connected) return;

        let cancelled = false;
        async function poll() {
            try {
                const data = await getCurrentlyPlaying();
                if (!cancelled) setTrack(data);
            } catch {
                if (!cancelled) setTrack(null);
            }
        }
        poll();
        const id = setInterval(poll, POLL_MS);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [connected]);

    if (!isConfigured()) {
        return (
            <div className="flex flex-col gap-3 text-sm">
                <p className="text-muted">
                    Connect Spotify to see what&apos;s playing and control it during breaks. Like Windows&apos; Focus
                    Sessions, Homeroom doesn&apos;t stream audio itself — it remote-controls whatever&apos;s already
                    playing in your Spotify app. Needs a free Spotify Developer client ID, set up once:
                </p>
                <ol className="flex flex-col gap-1.5 pl-5 list-decimal text-muted">
                    <li>
                        In the{' '}
                        <a
                            href="https://developer.spotify.com/dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent underline"
                        >
                            Spotify Developer Dashboard
                        </a>
                        , create an app.
                    </li>
                    <li>
                        Add <code className="text-xs">http://localhost:3000/spotify/callback</code> (and your production
                        URL&apos;s equivalent) as a Redirect URI.
                    </li>
                    <li>
                        Put the client ID in <code className="text-xs">.env.local</code> as{' '}
                        <code className="text-xs">NEXT_PUBLIC_SPOTIFY_CLIENT_ID=...</code> and restart the app.
                    </li>
                </ol>
                <p className="text-muted">Playback control (pause/resume/skip) requires Spotify Premium.</p>
            </div>
        );
    }

    if (!ready) return null;

    if (!connected) {
        return (
            <div className="flex flex-col gap-3">
                <p className="text-sm text-muted">Connect Spotify to see and control what&apos;s playing.</p>
                <div>
                    <button type="button" className="btn" onClick={beginAuth}>
                        Connect Spotify
                    </button>
                </div>
            </div>
        );
    }

    async function handlePlayPause() {
        setControlError('');
        try {
            await playPause(!!(track && track.is_playing));
            const fresh = await getCurrentlyPlaying();
            setTrack(fresh);
        } catch (error) {
            setControlError(error.message);
        }
    }

    async function handleSkip() {
        setControlError('');
        try {
            await skipNext();
            const fresh = await getCurrentlyPlaying();
            setTrack(fresh);
        } catch (error) {
            setControlError(error.message);
        }
    }

    const item = track?.item;

    return (
        <div className="flex flex-col gap-3">
            {item ? (
                <div className="flex items-center gap-3">
                    {item.album?.images?.[item.album.images.length - 1]?.url && (
                        <img
                            src={item.album.images[item.album.images.length - 1].url}
                            alt=""
                            className="w-12 h-12 rounded-lg shrink-0"
                        />
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">{item.name}</span>
                        <span className="text-sm truncate text-muted">
                            {item.artists?.map((a) => a.name).join(', ')}
                        </span>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-muted">Nothing playing right now — start something in Spotify.</p>
            )}

            <div className="flex gap-2">
                <button type="button" className="btn btn-ghost" onClick={handlePlayPause}>
                    {track?.is_playing ? 'Pause' : 'Play'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={handleSkip}>
                    Skip
                </button>
                <button
                    type="button"
                    className="btn btn-ghost ml-auto"
                    onClick={() => {
                        disconnect();
                        setConnected(false);
                    }}
                >
                    Disconnect
                </button>
            </div>

            {controlError && <Alert type="error">{controlError}</Alert>}
        </div>
    );
}
