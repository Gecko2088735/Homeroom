import '../styles/globals.css';
import { Footer } from '../components/footer';
import { Header } from '../components/header';
import { FocusProvider } from '../lib/focus-context';
import { StoreProvider } from '../lib/store';

export const metadata = {
    title: {
        template: '%s | Homeroom',
        default: 'Homeroom'
    },
    description: 'Track your class schedule and homework — all saved on this device.'
};

const themeInitScript = `try{var t=localStorage.getItem('homeroom:theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

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
                        <div className="flex flex-col min-h-screen px-4 sm:px-8">
                            <div className="flex flex-col w-full max-w-5xl mx-auto grow">
                                <Header />
                                <main className="grow pb-12">{children}</main>
                                <Footer />
                            </div>
                        </div>
                    </FocusProvider>
                </StoreProvider>
            </body>
        </html>
    );
}
