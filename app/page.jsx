'use client';

import { useEffect, useState } from 'react';
import { Nav } from 'components/nav';
import { CopyDiscordButton } from 'components/copy-discord-button';
import { LinkIcon, YoutubeIcon, DiscordIcon, NameMCIcon, RobloxIcon, TwitchIcon } from 'components/icons';
import { PROFILE, LANGUAGES, EXPERIENCE, LINKS } from 'data/profile';

const SECTIONS = [
    { id: 'home', label: 'Home' },
    { id: 'contact', label: 'Contact' },
    { id: 'hardware', label: 'Hardware' },
    { id: 'experience', label: 'Experience' },
    { id: 'questions', label: 'Questions' },
    { id: 'links', label: 'Links' }
];

const ICONS = {
    link: LinkIcon,
    youtube: YoutubeIcon,
    discord: DiscordIcon,
    namemc: NameMCIcon,
    roblox: RobloxIcon,
    twitch: TwitchIcon
};

export default function Page() {
    const [active, setActive] = useState('home');
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        const syncFromHash = () => {
            const id = window.location.hash.replace('#', '');
            if (SECTIONS.some((section) => section.id === id)) setActive(id);
        };
        syncFromHash();
        window.addEventListener('hashchange', syncFromHash);
        return () => window.removeEventListener('hashchange', syncFromHash);
    }, []);

    function selectSection(id) {
        setActive(id);
        window.location.hash = id;
    }

    return (
        <div className="relative min-h-screen bg-black">
            <div
                className={`transition-[filter,scale] duration-1000 ease-out ${
                    entered ? 'blur-none scale-100' : 'blur-2xl scale-105 pointer-events-none select-none'
                }`}
            >
                <div className="flex flex-col w-full max-w-4xl min-h-screen px-6 mx-auto sm:px-10">
                    <Nav sections={SECTIONS} active={active} onSelect={selectSection} />
                    <main className="pb-16 grow">
                        {active === 'home' && <HomeSection />}
                        {active === 'contact' && <ContactSection />}
                        {active === 'hardware' && <HardwareSection />}
                        {active === 'experience' && <ExperienceSection />}
                        {active === 'questions' && <QuestionsSection />}
                        {active === 'links' && <LinksSection />}
                    </main>
                    <footer className="py-10 text-center">
                        <p className="text-sm text-neutral-500">© 2026 {PROFILE.name}</p>
                    </footer>
                </div>
            </div>

            {!entered && (
                <button
                    type="button"
                    onClick={() => setEntered(true)}
                    className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer bg-black/50"
                >
                    <span className="text-lg font-medium tracking-wide text-white">click to enter.</span>
                </button>
            )}
        </div>
    );
}

function SectionLabel({ children }) {
    return <p className="mb-2 text-xs font-semibold tracking-widest uppercase text-neutral-500">{children}</p>;
}

function HomeSection() {
    return (
        <div className="flex flex-col items-center max-w-xl gap-5 mx-auto pt-8 text-center">
            <div className="flex items-center justify-center w-28 h-28 overflow-hidden border-2 rounded-full border-neutral-700 bg-neutral-900">
                <span className="text-3xl font-black text-neutral-500">S</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{PROFILE.name}</h1>
            <p className="text-base leading-relaxed text-neutral-300">{PROFILE.tagline}</p>
        </div>
    );
}

function ContactSection() {
    return (
        <div className="max-w-xl mx-auto">
            <SectionLabel>Contact</SectionLabel>
            <h2 className="mb-6 text-2xl font-black tracking-tight sm:text-3xl">Get in touch</h2>
            <div className="flex flex-col items-start gap-4 p-6 border rounded-lg border-neutral-800 bg-neutral-950 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs text-neutral-500">Discord</p>
                    <p className="text-lg font-bold">{PROFILE.discordUsername}</p>
                </div>
                <CopyDiscordButton username={PROFILE.discordUsername} />
            </div>
        </div>
    );
}

function HardwareSection() {
    return (
        <div>
            <SectionLabel>Hardware</SectionLabel>
            <h2 className="mb-8 text-2xl font-black tracking-tight sm:text-3xl">Languages I know</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {LANGUAGES.map((lang) => (
                    <div
                        key={lang}
                        className="flex items-center justify-center px-4 py-8 text-center border rounded-lg border-neutral-800 bg-neutral-950"
                    >
                        <span className="font-bold">{lang}</span>
                    </div>
                ))}
            </div>
            <p className="mt-6 text-sm text-neutral-500">More to come.</p>
        </div>
    );
}

function ExperienceSection() {
    return (
        <div>
            <SectionLabel>Experience</SectionLabel>
            <h2 className="mb-8 text-2xl font-black tracking-tight sm:text-3xl">What I&apos;ve built</h2>
            <div className="flex flex-col gap-4">
                {EXPERIENCE.map((item) => (
                    <div key={item.title} className="p-6 border rounded-lg border-neutral-800 bg-neutral-950">
                        <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                        <p className="leading-relaxed text-neutral-300">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function QuestionsSection() {
    return (
        <div className="max-w-xl mx-auto">
            <SectionLabel>Questions</SectionLabel>
            <h2 className="mb-6 text-2xl font-black tracking-tight sm:text-3xl">Need help?</h2>
            <div className="flex flex-col items-start gap-4 p-6 border rounded-lg border-neutral-800 bg-neutral-950 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-neutral-300">Need help or have any questions? My discord is the best way to contact me.</p>
                <CopyDiscordButton username={PROFILE.discordUsername} />
            </div>
        </div>
    );
}

function LinksSection() {
    return (
        <div>
            <SectionLabel>Links</SectionLabel>
            <h2 className="mb-8 text-2xl font-black tracking-tight sm:text-3xl">Find me elsewhere</h2>
            <div className="grid grid-cols-3 gap-6 sm:grid-cols-6">
                {LINKS.map((link) => {
                    const Icon = ICONS[link.icon];
                    return (
                        <div key={link.label} className="flex flex-col items-center gap-2">
                            {link.copy ? (
                                <CopyDiscordButton username={link.copy} icon={Icon} />
                            ) : (
                                <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-14 h-14 transition rounded-full bg-neutral-900 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:bg-neutral-800 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                                >
                                    <Icon className="w-6 h-6 text-white" />
                                </a>
                            )}
                            <span className="text-xs text-neutral-400">{link.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
