import { useCallback, useEffect, useState } from "react";
import StatCard from "../../components/admin/StatCard";
import { getUsers, updateVipStatus } from "../../lib/admin";
import type { AdminProfile } from "../../types/admin";

export default function AdminVip() {
    const [vipUsers, setVipUsers] = useState<AdminProfile[]>([]);
    const [allUsers, setAllUsers] = useState<AdminProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await getUsers();
        setAllUsers(data);
        setVipUsers(data.filter((u) => u.vip_status));
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    async function revoke(user: AdminProfile) {
        const { error } = await updateVipStatus(user.id, false);
        if (error) alert(error);
        else load();
    }

    async function grant(userId: string) {
        const { error } = await updateVipStatus(userId, true);
        if (error) alert(error);
        else load();
    }

    const nonVip = allUsers.filter((u) => !u.vip_status);

    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="VIP Members" value={vipUsers.length} accent="amber" />
                <StatCard label="Total Users" value={allUsers.length} accent="cyan" />
                <StatCard label="Non-VIP" value={nonVip.length} accent="violet" />
            </div>

            <section>
                <h2 className="mb-4 text-lg font-bold text-amber-200">VIP Members</h2>
                {loading ? (
                    <p className="text-slate-500">Loading…</p>
                ) : vipUsers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-amber-500/20 px-6 py-12 text-center text-slate-500">
                        No VIP members yet.
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {vipUsers.map((u) => (
                            <div key={u.id} className="flex items-center justify-between rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-transparent p-4 hover:border-amber-400/40 hover:shadow-[0_0_24px_rgba(251,191,36,0.1)]">
                                <div>
                                    <p className="font-semibold text-white">{u.email}</p>
                                    <p className="text-xs text-amber-300/80">VIP Member</p>
                                </div>
                                <button type="button" onClick={() => revoke(u)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-300">Revoke</button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="mb-4 text-lg font-bold text-white">Quick grant VIP</h2>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e14]/80">
                    <ul className="divide-y divide-white/5">
                        {nonVip.slice(0, 10).map((u) => (
                            <li key={u.id} className="flex items-center justify-between px-4 py-3">
                                <span className="text-sm text-slate-300">{u.email}</span>
                                <button type="button" onClick={() => grant(u.id)} className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/20">Grant VIP</button>
                            </li>
                        ))}
                        {nonVip.length === 0 && !loading && (
                            <li className="px-4 py-8 text-center text-slate-500">All users are VIP</li>
                        )}
                    </ul>
                </div>
            </section>
        </div>
    );
}
