export const metadata = {
    title: 'Privacy Policy'
};

export default function PrivacyPage() {
    return (
        <div className="flex flex-col max-w-2xl gap-6">
            <div>
                <h1>Privacy Policy</h1>
                <p className="text-sm text-muted">Last updated September 2026.</p>
            </div>

            <section className="flex flex-col gap-2">
                <h3>What Homeroom is</h3>
                <p className="text-sm text-muted">
                    Homeroom is a class schedule and homework tracker. It has no server and no accounts — everything
                    you enter, and everything imported from Google Classroom, is stored only in your own browser on
                    your own device, using its local storage. We never see it, collect it, or store a copy of it
                    anywhere.
                </p>
            </section>

            <section className="flex flex-col gap-2">
                <h3>What Google data Homeroom accesses</h3>
                <p className="text-sm text-muted">
                    If you choose to connect Google Classroom, Homeroom asks Google for permission to read:
                </p>
                <ul className="flex flex-col gap-1 pl-5 text-sm list-disc text-muted">
                    <li>Your Classroom courses (name, room, and a link back to the class)</li>
                    <li>Coursework and due dates for those courses</li>
                    <li>Your own grades and late-submission status on that coursework</li>
                    <li>Class announcements</li>
                </ul>
                <p className="text-sm text-muted">
                    This access is read-only. Homeroom never creates, edits, deletes, or submits anything in Google
                    Classroom, and never accesses any other student&apos;s data.
                </p>
            </section>

            <section className="flex flex-col gap-2">
                <h3>How that data is used and stored</h3>
                <p className="text-sm text-muted">
                    Data pulled from Google Classroom is sent directly from your browser to your browser&apos;s local
                    storage — it never passes through, or gets stored on, any server we operate, because we don&apos;t
                    operate one. It is never sold, shared, or used for advertising, analytics, or any purpose besides
                    displaying it back to you inside the app. Your Google sign-in itself is also never stored: it
                    stays in memory for your browsing session and is discarded when you close the tab or after about
                    an hour.
                </p>
            </section>

            <section className="flex flex-col gap-2">
                <h3>How to remove your data</h3>
                <ul className="flex flex-col gap-1 pl-5 text-sm list-disc text-muted">
                    <li>
                        In Homeroom&apos;s Settings page, &ldquo;Clear all data&rdquo; permanently deletes everything
                        stored in your browser.
                    </li>
                    <li>
                        To revoke Homeroom&apos;s access to your Google account entirely, visit{' '}
                        <a
                            href="https://myaccount.google.com/permissions"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent underline"
                        >
                            Google Account &rsaquo; Security &rsaquo; Third-party access
                        </a>{' '}
                        and remove Homeroom.
                    </li>
                </ul>
            </section>

            <section className="flex flex-col gap-2">
                <h3>Contact</h3>
                <p className="text-sm text-muted">
                    Questions about this policy or the app can be sent to{' '}
                    <a href="mailto:myhomeroomsupport@gmail.com" className="text-accent underline">
                        myhomeroomsupport@gmail.com
                    </a>
                    .
                </p>
            </section>
        </div>
    );
}
