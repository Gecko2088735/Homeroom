const base = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
};

export function LinkIcon(props) {
    return (
        <svg {...base} {...props}>
            <rect x="3" y="7" width="10" height="7" rx="3.5" />
            <rect x="11" y="10" width="10" height="7" rx="3.5" />
        </svg>
    );
}

export function YoutubeIcon(props) {
    return (
        <svg {...base} {...props}>
            <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
            <path d="M10.5 9.3v5.4l5-2.7-5-2.7z" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function DiscordIcon(props) {
    return (
        <svg {...base} {...props}>
            <rect x="3" y="4.5" width="18" height="13" rx="4" />
            <path d="M7 17.5l-2.5 2.5V17.5" />
            <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
            <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function NameMCIcon(props) {
    return (
        <svg {...base} {...props}>
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M8 16V8l8 8V8" />
        </svg>
    );
}

export function RobloxIcon(props) {
    return (
        <svg {...base} {...props}>
            <rect x="6.5" y="6.5" width="11" height="11" rx="2" transform="rotate(-18 12 12)" />
        </svg>
    );
}

export function TwitchIcon(props) {
    return (
        <svg {...base} {...props}>
            <path d="M5 3.5h14v10l-4 4h-4l-2.5 2.5V17.5H5V3.5z" />
            <path d="M12 8v3.5M16 8v3.5" />
        </svg>
    );
}
