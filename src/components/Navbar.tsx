import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import UserMenu from "./UserMenu";
import { useAuth } from "../context/AuthContext";

const navLinks = [
    { label: "Home", to: "/" },
    { label: "Predictions", to: "/predictions" },
    { label: "VIP", to: "/vip" },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
    return `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        isActive
            ? "bg-cyan-500/10 text-cyan-300"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`;
}

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, profile, isVip, signOut, loading } = useAuth();

    async function handleMobileLogout() {
        await signOut();
        setMenuOpen(false);
    }

    return (
        <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#050508]/80 backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
                <Link
                    to="/"
                    className="group flex shrink-0 items-center gap-2.5"
                    aria-label="Football AI Home"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 shadow-[0_0_20px_rgba(34,211,238,0.35)]">
                        <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5 text-slate-950"
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
                            <path
                                d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1"
                                stroke="currentColor"
                                strokeWidth="1"
                                fill="none"
                            />
                        </svg>
                    </span>
                    <span className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-cyan-300">
                        Football <span className="text-cyan-400">AI</span>
                    </span>
                </Link>

                <ul className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <NavLink to={link.to} className={navLinkClass} end={link.to === "/"}>
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-2">
                    <div className="hidden md:block">
                        <UserMenu />
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 md:hidden"
                        aria-expanded={menuOpen}
                        aria-label="Toggle menu"
                        onClick={() => setMenuOpen((o) => !o)}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {menuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {menuOpen && (
                <div className="border-t border-white/5 bg-[#0a0b10]/95 px-4 py-4 md:hidden">
                    <ul className="flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <li key={link.label}>
                                <NavLink
                                    to={link.to}
                                    end={link.to === "/"}
                                    className={({ isActive }) =>
                                        `block rounded-lg px-4 py-3 text-sm font-medium ${
                                            isActive
                                                ? "bg-cyan-500/10 text-cyan-300"
                                                : "text-slate-400"
                                        }`
                                    }
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-4 border-t border-white/5 pt-4">
                        {!loading && !user && (
                            <div className="flex flex-col gap-2">
                                <Link
                                    to="/login"
                                    className="rounded-lg px-4 py-3 text-center text-sm font-medium text-slate-300"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-center text-sm font-semibold text-cyan-300"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                        {!loading && user && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 px-2">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? "U")}&size=64&background=0f172a&color=22d3ee&bold=true`}
                                        alt=""
                                        className="h-10 w-10 rounded-lg border border-cyan-500/20"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-white">
                                            {user.email}
                                        </p>
                                        {isVip && (
                                            <span className="mt-1 inline-flex rounded-md border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                                                VIP
                                            </span>
                                        )}
                                        {profile?.username && (
                                            <p className="truncate text-xs text-slate-500">
                                                @{profile.username}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleMobileLogout}
                                    className="w-full rounded-lg px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
