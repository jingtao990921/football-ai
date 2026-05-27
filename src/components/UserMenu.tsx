import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getAvatarUrl(email: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&size=80&background=0f172a&color=22d3ee&bold=true&format=png`;
}

export default function UserMenu() {
    const { user, profile, isVip, isAdmin, signOut, loading } = useAuth();
    const [open, setOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    if (loading) {
        return (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/5" />
        );
    }

    if (!user) {
        return (
            <>
                <Link
                    to="/login"
                    className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white sm:inline-block"
                >
                    Login
                </Link>
                <Link
                    to="/register"
                    className="hidden rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition-all hover:border-cyan-400/50 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] sm:inline-block"
                >
                    Register
                </Link>
            </>
        );
    }

    const email = user.email ?? profile?.email ?? "User";

    async function handleLogout() {
        setSigningOut(true);
        await signOut();
        setSigningOut(false);
        setOpen(false);
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 transition-colors hover:border-cyan-500/30 hover:bg-white/[0.08]"
                aria-expanded={open}
                aria-haspopup="true"
            >
                <img
                    src={getAvatarUrl(email)}
                    alt=""
                    className="h-8 w-8 rounded-lg border border-cyan-500/20 object-cover"
                />
                <span className="hidden max-w-[140px] truncate text-sm text-slate-300 sm:block">
                    {email}
                </span>
                {isVip && (
                    <span className="hidden rounded-md bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300 sm:inline">
                        VIP
                    </span>
                )}
                <svg
                    className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <>
                    <button
                        type="button"
                        className="fixed inset-0 z-40"
                        aria-label="Close menu"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-cyan-500/20 bg-[#0c0e14] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                        <div className="border-b border-white/5 p-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={getAvatarUrl(email)}
                                    alt=""
                                    className="h-12 w-12 rounded-xl border border-cyan-500/20"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-white">
                                        {profile?.username ?? email.split("@")[0]}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                        {email}
                                    </p>
                                    {isVip && (
                                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500/25 to-yellow-600/25 border border-amber-400/50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-200">
                                            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            VIP Member
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <Link
                                to="/vip"
                                className="block rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
                                onClick={() => setOpen(false)}
                            >
                                VIP Benefits
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="block rounded-lg px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/10"
                                    onClick={() => setOpen(false)}
                                >
                                    Admin Panel
                                </Link>
                            )}
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={signingOut}
                                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
                            >
                                {signingOut ? "Logging out…" : "Logout"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
