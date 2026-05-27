import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/admin/StatCard";
import { getAdminStats, type AdminStats } from "../../lib/admin";

export default function AdminHome() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminStats().then(({ data }) => {
            setStats(data);
            setLoading(false);
        });
    }, []);

    const links = [
        { to: "/admin/matches", label: "Manage Matches", desc: "Add, edit, delete fixtures" },
        { to: "/admin/predictions", label: "Manage Predictions", desc: "AI picks per match" },
        { to: "/admin/users", label: "Manage Users", desc: "Roles & permissions" },
        { to: "/admin/vip", label: "VIP Members", desc: "Grant or revoke VIP" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500/80">
                    Overview
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">Dashboard</h2>
            </div>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Matches" value={stats?.matches ?? 0} accent="cyan" />
                    <StatCard label="Predictions" value={stats?.predictions ?? 0} accent="violet" />
                    <StatCard label="Users" value={stats?.users ?? 0} accent="emerald" />
                    <StatCard label="VIP Users" value={stats?.vipUsers ?? 0} accent="amber" />
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                {links.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="group rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c0e14] to-[#080a10] p-5 transition-all hover:border-cyan-400/30 hover:shadow-[0_0_32px_rgba(34,211,238,0.1)]"
                    >
                        <h3 className="font-bold text-white group-hover:text-cyan-300">
                            {link.label}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">{link.desc}</p>
                        <span className="mt-3 inline-block text-xs text-cyan-500">Open →</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
