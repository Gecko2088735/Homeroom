// Fully client-side Google Classroom access: Google Identity Services (GIS) token flow
// in the browser, direct CORS calls to the Classroom REST API. No backend involved —
// imported data lands in localStorage like everything else.

import { toDateInputValue } from './dates';

export const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
    'https://www.googleapis.com/auth/classroom.announcements.readonly'
].join(' ');

export function isConfigured() {
    return !!CLIENT_ID;
}

let gisPromise = null;

function loadGis() {
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    if (!gisPromise) {
        gisPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.onload = resolve;
            script.onerror = () => {
                gisPromise = null;
                reject(new Error('Could not load Google sign-in. Check your connection and try again.'));
            };
            document.head.appendChild(script);
        });
    }
    return gisPromise;
}

// Access tokens are short-lived (~1h) and kept in memory only — nothing persisted.
let tokenCache = null;
let tokenClient = null;

export function clearToken() {
    tokenCache = null;
}

export async function getAccessToken() {
    if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token;
    await loadGis();
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: () => {}
            });
        }
        tokenClient.callback = (resp) => {
            if (resp.error) {
                reject(new Error(resp.error_description ?? resp.error));
            } else {
                tokenCache = {
                    token: resp.access_token,
                    expiresAt: Date.now() + (Number(resp.expires_in) - 60) * 1000
                };
                resolve(resp.access_token);
            }
        };
        tokenClient.error_callback = (err) => reject(new Error(err?.message ?? 'Sign-in was cancelled.'));
        tokenClient.requestAccessToken();
    });
}

async function apiGet(path, token, params = {}) {
    const url = new URL(`https://classroom.googleapis.com/v1/${path}`);
    for (const [key, value] of Object.entries(params)) {
        if (value) url.searchParams.set(key, value);
    }
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
        const error = new Error(`Google Classroom request failed (${res.status})`);
        error.status = res.status;
        throw error;
    }
    return res.json();
}

async function listAll(path, token, itemsKey, params = {}) {
    const items = [];
    let pageToken;
    do {
        const page = await apiGet(path, token, { ...params, pageToken });
        items.push(...(page[itemsKey] ?? []));
        pageToken = page.nextPageToken;
    } while (pageToken);
    return items;
}

// A course can deny access to a given sub-resource (e.g. teacher-only items, or a resource the
// requester isn't part of) without the whole sync failing — skip just that piece, keep the rest.
async function safeListAll(path, token, itemsKey, params) {
    try {
        return await listAll(path, token, itemsKey, params);
    } catch (error) {
        if (error.status === 403) return [];
        throw error;
    }
}

export async function fetchAllClassroomData() {
    const run = async (token) => {
        const courses = await listAll('courses', token, 'courses', { courseStates: 'ACTIVE' });
        const courseworkByCourse = {};
        const submissionsByCourse = {};
        const announcementsByCourse = {};
        for (const course of courses) {
            courseworkByCourse[course.id] = await safeListAll(`courses/${course.id}/courseWork`, token, 'courseWork', {
                pageSize: '100'
            });
            // courseWorkId '-' requests submissions for every assignment in the course in one call,
            // rather than one request per assignment. Scoped to the signed-in student's own work.
            submissionsByCourse[course.id] = await safeListAll(
                `courses/${course.id}/courseWork/-/studentSubmissions`,
                token,
                'studentSubmissions',
                { pageSize: '100' }
            );
            announcementsByCourse[course.id] = await safeListAll(
                `courses/${course.id}/announcements`,
                token,
                'announcements',
                { pageSize: '100' }
            );
        }
        return { courses, courseworkByCourse, submissionsByCourse, announcementsByCourse };
    };

    const token = await getAccessToken();
    try {
        return await run(token);
    } catch (error) {
        if (error.status !== 401) throw error;
        clearToken();
        return run(await getAccessToken());
    }
}

// Classroom dueDate/dueTime are expressed in UTC. With a time we convert to the local
// date + time; without one the date is taken as-is (an all-day deadline).
export function mapCourseWorkDue(cw) {
    if (!cw.dueDate) return null;
    const { year, month, day } = cw.dueDate;
    const hours = cw.dueTime?.hours;
    const minutes = cw.dueTime?.minutes;
    if (hours === undefined && minutes === undefined) {
        return {
            dueDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            dueTime: null
        };
    }
    const utc = new Date(Date.UTC(year, month - 1, day, hours ?? 0, minutes ?? 0));
    return {
        dueDate: toDateInputValue(utc),
        dueTime: `${String(utc.getHours()).padStart(2, '0')}:${String(utc.getMinutes()).padStart(2, '0')}`
    };
}
