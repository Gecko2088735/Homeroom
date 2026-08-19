import '../styles/globals.css';

export const metadata = {
    title: {
        template: '%s | Swiftness',
        default: 'Swiftness'
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
            </head>
            <body className="antialiased text-white bg-black">{children}</body>
        </html>
    );
}
