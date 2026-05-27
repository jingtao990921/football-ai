import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/matches", label: "Matches", end: false },
    { to: "/admin/predictions", label: "Predictions", end: false },
    { to: "/admin/users", label: "Users", end: false },
    { to: "/admin/vip", label: "VIP", end: false },
];

function navClass({ isActive }: { isActive: boolean }) {
    return `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
        isActive
            ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.12)]"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`;
}

export default function AdminDashboard() {
    const { profile, signOut } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const pageTitle =
        navItems.find((n) =>
            n.end
                ? location.pathname === n.to
                : location.pathname.startsWith(n.to) && n.to !== "/admin"
        )?.label ?? "Dashboard";

    return (
        <div className="flex min-h-screen bg-[#050508] text-slate-200">
            {sidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-cyan-500/10 bg-[#080a10]/95 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-16 items-center gap-2 border-b border-white/5 px-5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 text-xs font-black text-slate-950">
                        AI
                    </span>
                    <div>
                        <p className="text-sm font-bold text-white">
                            Football AI Admin
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-cyan-500/80">
                            Control Panel
                        </p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={navClass}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-white/5 p-4">
                    <Link
                        to="/"
                        className="block rounded-xl px-4 py-2.5 text-center text-xs text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
                    >
                        ← Back to site
                    </Link>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-cyan-500/10 bg-[#050508]/90 px-4 backdrop-blur-xl sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="rounded-lg border border-white/10 p-2 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-500/80">
                                Football AI Admin
                            </p>
                            <h1 className="text-lg font-bold text-white sm:text-xl">
                                {pageTitle}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden max-w-[160px] truncate text-xs text-slate-500 sm:block">
                            {profile?.email}
                        </span>
                        <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-300">
                            Admin
                        </span>
                        <button
                            type="button"
                            onClick={() => signOut()}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto bg-[#050508] p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
