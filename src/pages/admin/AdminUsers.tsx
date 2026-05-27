import { useCallback, useEffect, useMemo, useState } from "react";
import { getUsers, updateUserRole, updateVipStatus } from "../../lib/admin";
import type { AdminProfile } from "../../types/admin";

export default function AdminUsers() {
    const [users, setUsers] = useState<AdminProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await getUsers();
        setUsers(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        return users.filter((u) => {
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                (u.email?.toLowerCase().includes(q) ?? false) ||
                (u.username?.toLowerCase().includes(q) ?? false);
            const matchRole = !roleFilter || u.role === roleFilter;
            return matchSearch && matchRole;
        });
    }, [users, search, roleFilter]);

    async function setVip(user: AdminProfile, vip: boolean) {
        const { error } = await updateVipStatus(user.id, vip);
        if (error) alert(error);
        else load();
    }

    async function setRole(user: AdminProfile, role: string) {
        if (role === "admin" && !confirm(`Grant admin to ${user.email}?`)) return;
        const { error } = await updateUserRole(user.id, role);
        if (error) alert(error);
        else load();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    type="search"
                    placeholder="Search email or username…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white"
                >
                    <option value="">All roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-emerald-500/10 bg-[#0c0e14]/80">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">VIP</th>
                                <th className="px-4 py-3">Joined</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No users found</td></tr>
                            ) : (
                                filtered.map((u) => (
                                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-white">{u.email}</p>
                                            {u.username && <p className="text-xs text-slate-500">@{u.username}</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${u.role === "admin" ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300" : "border-white/10 text-slate-400"}`}>
                                                {u.role ?? "user"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{u.vip_status ? <span className="text-amber-300">Yes</span> : <span className="text-slate-500">No</span>}</td>
                                        <td className="px-4 py-3 text-slate-500 tabular-nums">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {u.vip_status ? (
                                                    <button type="button" onClick={() => setVip(u, false)} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 hover:bg-white/5">Revoke VIP</button>
                                                ) : (
                                                    <button type="button" onClick={() => setVip(u, true)} className="rounded-lg border border-amber-400/30 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/10">Set VIP</button>
                                                )}
                                                {u.role !== "admin" ? (
                                                    <button type="button" onClick={() => setRole(u, "admin")} className="rounded-lg border border-emerald-400/30 px-2 py-1 text-xs text-emerald-300">Make Admin</button>
                                                ) : (
                                                    <button type="button" onClick={() => setRole(u, "user")} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400">Remove Admin</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
