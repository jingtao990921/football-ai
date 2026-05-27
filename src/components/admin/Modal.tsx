import { useEffect, type ReactNode } from "react";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    wide?: boolean;
};

export default function Modal({
    open,
    onClose,
    title,
    children,
    wide,
}: ModalProps) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
            <button
                type="button"
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                aria-label="Close modal"
                onClick={onClose}
            />
            <div
                className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#0c0e14] to-[#080a10] p-5 shadow-[0_0_60px_rgba(34,211,238,0.12)] sm:p-6 ${
                    wide ? "max-w-2xl" : "max-w-lg"
                }`}
            >
                <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function AdminInput({
    label,
    id,
    type = "text",
    value,
    onChange,
    required,
    placeholder,
    as = "input",
    rows = 3,
}: {
    label: string;
    id: string;
    type?: string;
    value: string | number;
    onChange: (v: string) => void;
    required?: boolean;
    placeholder?: string;
    as?: "input" | "textarea" | "select";
    rows?: number;
}) {
    const base =
        "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20";

    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {label}
            </label>
            {as === "textarea" ? (
                <textarea
                    id={id}
                    rows={rows}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    placeholder={placeholder}
                    className={base}
                />
            ) : (
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    placeholder={placeholder}
                    className={base}
                />
            )}
        </div>
    );
}

export function AdminBtn({
    children,
    variant = "primary",
    type = "button",
    onClick,
    disabled,
}: {
    children: ReactNode;
    variant?: "primary" | "ghost" | "danger";
    type?: "button" | "submit";
    onClick?: () => void;
    disabled?: boolean;
}) {
    const styles = {
        primary:
            "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_28px_rgba(34,211,238,0.4)]",
        ghost: "border border-white/10 text-slate-300 hover:bg-white/5",
        danger: "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`rounded-xl px-4 py-2.5 text-sm transition-all disabled:opacity-50 ${styles[variant]}`}
        >
            {children}
        </button>
    );
}
