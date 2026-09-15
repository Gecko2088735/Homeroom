import '../styles/globals.css';
import { ClassroomSyncProvider } from '../lib/classroom-sync-context';
import { FocusProvider } from '../lib/focus-context';
import { StoreProvider } from '../lib/store';

export const metadata = {
    title: {
        template: '%s | Homeroom',
        default: 'Homeroom'
    },
    description: 'Track your class schedule and homework — all saved on this device.'
};

// Dark is the default look — it only stays light once the user explicitly picks it via the toggle.
const themeInitScript = `try{if(localStorage.getItem('homeroom:theme')!=='light')document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </head>
            <body className="antialiased">
                <StoreProvider>
                    <FocusProvider>
                        <ClassroomSyncProvider>{children}</ClassroomSyncProvider>
                    </FocusProvider>
                </StoreProvider>
            </body>
        </html>
    );
}
