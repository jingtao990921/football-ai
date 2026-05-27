import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthCardProps = {
    title: string;
    subtitle: string;
    children: ReactNode;
    footer?: ReactNode;
};

export default function AuthCard({
    title,
    subtitle,
    children,
    footer,
}: AuthCardProps) {
    return (
        <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#0c0e14] to-[#080a10] p-6 shadow-[0_0_60px_rgba(34,211,238,0.08)] sm:p-8">
                <div
                    className="pointer-events-none absolute inset-0 opacity-60"
                    aria-hidden
                    style={{
                        background:
                            "radial-gradient(400px circle at 50% 0%, rgba(34,211,238,0.12), transparent 70%)",
                    }}
                />

                <div className="relative mb-8 text-center">
                    <Link
                        to="/"
                        className="mb-6 inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-cyan-300"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500">
                            <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4 text-slate-950"
                                fill="currentColor"
                                aria-hidden
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                />
                            </svg>
                        </span>
                        <span className="text-sm font-semibold text-white">
                            Football <span className="text-cyan-400">AI</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">{title}</h1>
                    <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
                </div>

                <div className="relative">{children}</div>

                {footer && (
                    <div className="relative mt-6 border-t border-white/5 pt-6 text-center text-sm text-slate-400">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export function AuthInput({
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    autoComplete,
    required = true,
}: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    autoComplete?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
        </div>
    );
}

export function AuthButton({
    children,
    loading,
    type = "submit",
}: {
    children: ReactNode;
    loading?: boolean;
    type?: "submit" | "button";
}) {
    return (
        <button
            type={type}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)] transition-all hover:shadow-[0_0_32px_rgba(34,211,238,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
        >
            {loading ? "Please wait…" : children}
        </button>
    );
}

export function AuthError({ message }: { message: string | null }) {
    if (!message) return null;
    return (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {message}
        </div>
    );
}
