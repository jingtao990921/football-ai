import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Modal, { AdminBtn, AdminInput } from "../../components/admin/Modal";
import type { Match } from "../../types/match";
import {
    createMatch,
    deleteMatch,
    getMatches,
    updateMatch,
    type MatchInput,
} from "../../lib/admin";
import {
    resolveMatchStatus,
    STATUS_LABELS,
    type MatchStatus,
} from "../../utils/matchStatus";

const STATUS_OPTIONS = [
    { value: "", label: "Auto (from time)" },
    { value: "upcoming", label: "Upcoming" },
    { value: "live", label: "Live" },
    { value: "finished", label: "Finished" },
];

const emptyForm = (): MatchInput & { id?: string } => ({
    home_team: "",
    away_team: "",
    league: "",
    match_time: new Date().toISOString().slice(0, 16),
    status: "",
});

export default function AdminMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | MatchStatus>("");
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const { data, error: e } = await getMatches();
        if (e) setError(e);
        else setMatches(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        return matches.filter((m) => {
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                m.home_team.toLowerCase().includes(q) ||
                m.away_team.toLowerCase().includes(q) ||
                m.league.toLowerCase().includes(q);
            const status = resolveMatchStatus(m.match_time, m.status);
            const matchStatus = !statusFilter || status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [matches, search, statusFilter]);

    function openCreate() {
        setForm(emptyForm());
        setError(null);
        setModalOpen(true);
    }

    function openEdit(m: Match) {
        setForm({
            id: m.id,
            home_team: m.home_team,
            away_team: m.away_team,
            league: m.league,
            match_time: new Date(m.match_time).toISOString().slice(0, 16),
            status: m.status ?? "",
        });
        setError(null);
        setModalOpen(true);
    }

    async function handleSave(e: FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const payload: MatchInput = {
            home_team: form.home_team.trim(),
            away_team: form.away_team.trim(),
            league: form.league.trim(),
            match_time: new Date(form.match_time).toISOString(),
            status: form.status || null,
        };

        const result = form.id
            ? await updateMatch(form.id, payload)
            : await createMatch(payload);

        setSaving(false);
        if (result.error) {
            setError(result.error);
            return;
        }
        setModalOpen(false);
        load();
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this match? Related predictions will also be removed."))
            return;
        const { error: e } = await deleteMatch(id);
        if (e) alert(e);
        else load();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                    {filtered.length} match{filtered.length !== 1 ? "es" : ""}
                </p>
                <AdminBtn onClick={openCreate}>+ Add Match</AdminBtn>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    type="search"
                    placeholder="Search teams or league…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "" | MatchStatus)}
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
                >
                    <option value="">All statuses</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="finished">Finished</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-cyan-500/10 bg-[#0c0e14]/80 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
                                <th className="px-4 py-3">Fixture</th>
                                <th className="px-4 py-3">League</th>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                        Loading…
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                        No matches found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((m) => {
                                    const st = resolveMatchStatus(m.match_time, m.status);
                                    return (
                                        <tr
                                            key={m.id}
                                            className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                                        >
                                            <td className="px-4 py-3 font-medium text-white">
                                                {m.home_team} vs {m.away_team}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">{m.league}</td>
                                            <td className="px-4 py-3 text-slate-400 tabular-nums">
                                                {new Date(m.match_time).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300">
                                                    {STATUS_LABELS[st]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(m)}
                                                    className="mr-2 text-cyan-400 hover:text-cyan-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(m.id)}
                                                    className="text-rose-400 hover:text-rose-300"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={form.id ? "Edit Match" : "Add Match"}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    {error && (
                        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                            {error}
                        </p>
                    )}
                    <AdminInput id="home" label="Home team" value={form.home_team} onChange={(v) => setForm((f) => ({ ...f, home_team: v }))} required />
                    <AdminInput id="away" label="Away team" value={form.away_team} onChange={(v) => setForm((f) => ({ ...f, away_team: v }))} required />
                    <AdminInput id="league" label="League" value={form.league} onChange={(v) => setForm((f) => ({ ...f, league: v }))} required />
                    <AdminInput id="time" label="Match time" type="datetime-local" value={form.match_time} onChange={(v) => setForm((f) => ({ ...f, match_time: v }))} required />
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Status
                        </label>
                        <select
                            value={form.status ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white"
                        >
                            {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <AdminBtn type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</AdminBtn>
                        <AdminBtn variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminBtn>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
