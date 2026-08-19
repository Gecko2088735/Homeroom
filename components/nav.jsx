'use client';

export function Nav({ sections, active, onSelect }) {
    return (
        <nav className="flex items-center justify-center py-8 sm:py-10">
            <ul className="flex flex-wrap items-center justify-center gap-1 p-1 border rounded-full border-neutral-800 bg-neutral-950">
                {sections.map((section) => (
                    <li key={section.id}>
                        <button
                            type="button"
                            onClick={() => onSelect(section.id)}
                            className={`px-4 py-2 text-sm font-bold rounded-full transition ${
                                active === section.id ? 'bg-white text-black' : 'text-neutral-300 hover:text-white'
                            }`}
                        >
                            {section.label}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
