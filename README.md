# Homeroom

A simple class schedule and homework tracker. Add your classes and homework, see what's next on
the home screen, browse your week on the calendar, and optionally pull in assignments from Google
Classroom — all without an account.

## How your data is stored

Homeroom has no backend and no accounts. Everything — classes, homework, your theme choice — is
saved in this browser's `localStorage`, on this device only. There is no server-side database and
nothing syncs across devices. Clearing your browser data (or using a different browser/device)
starts you over.

## Features

- **Home screen** — a customizable grid of widgets (countdown, today's classes, due soon, a mini
  Focus timer, and more). Tap the pencil button to drag widgets into a new order, remove them, or
  add more from the picker; your layout is remembered.
- **Classes** — add a class with a name, color, optional location, and a weekly recurring
  schedule (pick days, set one shared time or a time per day). Each class's color carries through
  its cards, homework chips, and calendar blocks.
- **Homework** — title, due date/time, optional notes (shown when you open an item, not on the
  card), linked to a class, mark complete/incomplete.
- **Calendar** — a week-at-a-glance grid with `‹` `›` arrows to move between weeks.
- **Focus** — a configurable-length Pomodoro timer (25/5 minutes by default) that auto-advances,
  with a chime and browser notification on each transition.
- **Light/dark themes** — a light-blue accent in both; dark mode uses a near-black, Chrome-style
  palette. Toggle in the header or Settings; your choice is remembered.
- **Google Classroom sync** (optional) — pull in your courses and assignments straight from the
  browser. See below to set it up.

## Developing locally

1. Clone this repository, then run `npm install` in its root directory.
2. Run `npm run dev`, then open [http://localhost:3000](http://localhost:3000).
3. Run `npm run build` to produce a static production build, or `npm run lint` to check the code.

No environment variables are required to use the app with manual entry.

## Setting up Google Classroom sync (optional)

This is a one-time setup for whoever runs the app. It creates a free Google OAuth client ID that
lets the app ask a signed-in Google user for read-only access to their own Classroom data — the
sign-in and API calls happen entirely in the browser, and the imported data is still saved only to
that browser's `localStorage`. No server of ours is involved.

1. In the [Google Cloud Console](https://console.cloud.google.com/), create a project (or pick an
   existing one) and enable the **Google Classroom API** under "APIs & Services".
2. Under "APIs & Services" → "Credentials", create an **OAuth client ID** of type
   **Web application**.
3. Add the address(es) you'll run this app from to **Authorized JavaScript origins** — for local
   development that's `http://localhost:3000`; add your production URL too if you deploy it.
4. Copy the client ID and put it in a `.env.local` file at the project root:

   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

5. Restart the dev server (or rebuild). The Settings page will now show a "Sign in with Google &
   sync" button instead of setup instructions.

Once configured, each user just clicks "Sign in with Google & sync" — no further setup on their
end. Access tokens are kept in memory only (never stored), and re-syncing never creates duplicate
classes or assignments; if you've edited an imported item's title, notes, or due date by hand,
re-syncing keeps your edit instead of overwriting it.

## Tech

Next.js 16 (App Router), React 19, Tailwind CSS v4. No backend, no database — everything client-side.
