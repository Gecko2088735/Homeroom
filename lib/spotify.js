'use client';

// Client-side-only Spotify integration: Authorization Code + PKCE (no client secret, no
// backend — the token exchange is a plain fetch from the browser). Mirrors the Windows Focus
// Sessions model: we don't stream audio ourselves, we just read what's currently playing and
// (Premium accounts only) remote-control whatever device the user already has Spotify open on.

export const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SCOPES = 'user-read-currently-playing user-read-playback-state user-modify-playback-state';
const REFRESH_KEY = 'homeroom:spotify-refresh-token';
const VERIFIER_KEY = 'homeroom:spotify-pkce-verifier';
const STATE_KEY = 'homeroom:spotify-pkce-state';

export function isConfigured() {
    return !!CLIENT_ID;
}

export function redirectUri() {
    return `${window.location.origin}/spotify/callback`;
}

function base64url(bytes) {
    let str = '';
    for (const b of bytes) str += String.fromCharCode(b);
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(text) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return new Uint8Array(digest);
}

function randomString(length) {
    return base64url(crypto.getRandomValues(new Uint8Array(length))).slice(0, length);
}

export async function beginAuth() {
    const verifier = randomString(64);
    const state = randomString(32);
    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);
    const challenge = base64url(await sha256(verifier));

    const url = new URL('https://accounts.spotify.com/authorize');
    url.searchParams.set('client_id', CLIENT_ID);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', redirectUri());
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('scope', SCOPES);
    url.searchParams.set('state', state);
    window.location.href = url.toString();
}

// Called from app/spotify/callback/page.jsx once Spotify redirects back with ?code&state.
export async function completeAuth(code, state) {
    const expectedState = sessionStorage.getItem(STATE_KEY);
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(VERIFIER_KEY);
    if (!verifier || !state || state !== expectedState) {
        throw new Error('Sign-in could not be verified — please try connecting again.');
    }

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri(),
            client_id: CLIENT_ID,
            code_verifier: verifier
        })
    });
    if (!res.ok) throw new Error('Spotify sign-in failed.');
    const json = await res.json();
    localStorage.setItem(REFRESH_KEY, json.refresh_token);
    tokenCache = { token: json.access_token, expiresAt: Date.now() + (json.expires_in - 60) * 1000 };
}

export function isConnected() {
    return !!localStorage.getItem(REFRESH_KEY);
}

export function disconnect() {
    localStorage.removeItem(REFRESH_KEY);
    tokenCache = null;
}

// Access tokens are short-lived; kept in memory and refreshed via the persisted refresh token.
let tokenCache = null;

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) throw new Error('Spotify is not connected.');
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: CLIENT_ID })
    });
    if (!res.ok) {
        disconnect();
        throw new Error('Your Spotify session expired — please reconnect.');
    }
    const json = await res.json();
    if (json.refresh_token) localStorage.setItem(REFRESH_KEY, json.refresh_token);
    tokenCache = { token: json.access_token, expiresAt: Date.now() + (json.expires_in - 60) * 1000 };
    return tokenCache.token;
}

async function getAccessToken() {
    if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token;
    return refreshAccessToken();
}

async function apiCall(path, { method = 'GET' } = {}) {
    const token = await getAccessToken();
    return fetch(`https://api.spotify.com/v1/${path}`, { method, headers: { Authorization: `Bearer ${token}` } });
}

// Reading playback state works on any account tier; the app only ever reads via this call.
export async function getCurrentlyPlaying() {
    const res = await apiCall('me/player/currently-playing');
    if (res.status === 204 || res.status === 404) return null; // nothing currently playing
    if (!res.ok) throw Object.assign(new Error('Could not read Spotify playback state.'), { status: res.status });
    return res.json();
}

// Controlling playback requires Spotify Premium — Spotify returns 403 on free accounts.
export async function playPause(isPlaying) {
    const res = await apiCall(`me/player/${isPlaying ? 'pause' : 'play'}`, { method: 'PUT' });
    if (!res.ok && res.status !== 204) {
        throw Object.assign(new Error('Playback control needs Spotify Premium.'), { status: res.status });
    }
}

export async function skipNext() {
    const res = await apiCall('me/player/next', { method: 'POST' });
    if (!res.ok && res.status !== 204) {
        throw Object.assign(new Error('Playback control needs Spotify Premium.'), { status: res.status });
    }
}

// Best-effort auto pause/resume around Focus Session breaks — silently does nothing if not
// connected, there's no active device, or the account can't control playback (free tier).
export async function pauseForBreak() {
    if (!isConfigured() || !isConnected()) return;
    try {
        await apiCall('me/player/pause', { method: 'PUT' });
    } catch {
        // best-effort only
    }
}

export async function resumeForWork() {
    if (!isConfigured() || !isConnected()) return;
    try {
        await apiCall('me/player/play', { method: 'PUT' });
    } catch {
        // best-effort only
    }
}
