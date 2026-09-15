import { Footer } from '../../components/footer';
import { Header } from '../../components/header';

export default function MainLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen px-4 sm:px-8">
            <div className="flex flex-col w-full max-w-5xl mx-auto grow">
                <Header />
                <main className="grow pb-12">{children}</main>
                <Footer />
            </div>
        </div>
    );
}
