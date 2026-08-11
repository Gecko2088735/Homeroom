export function Card({ title, children, className, onClick }) {
    const Tag = onClick ? 'button' : 'div';
    return (
        <Tag
            onClick={onClick}
            className={[
                'bg-surface border border-edge rounded-xl text-left w-full',
                onClick ? 'cursor-pointer transition-colors hover:bg-surface-hover' : '',
                className
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div className="flex flex-col gap-3 px-5 py-5">
                {title && <h3>{title}</h3>}
                {children}
            </div>
        </Tag>
    );
}
