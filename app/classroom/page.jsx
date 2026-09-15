import Link from 'next/link';
import { ClassroomSync } from 'components/classroom-sync';

export const metadata = {
    title: 'Google Classroom'
};

export default function ClassroomPage() {
    return (
        <div className="dark flex flex-col min-h-screen px-4 bg-background text-foreground sm:px-8">
            <Link href="/" className="pt-6 text-2xl font-black tracking-tight text-accent no-underline sm:pt-8 sm:text-3xl">
                Homeroom
            </Link>
            <div className="flex flex-col items-center justify-center grow gap-6 py-12 mx-auto w-full max-w-sm">
                <ClassroomSync />
            </div>
        </div>
    );
}
