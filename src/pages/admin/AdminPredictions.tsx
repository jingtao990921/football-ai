import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Modal, { AdminBtn, AdminInput } from "../../components/admin/Modal";
import {
    createPrediction,
    deletePrediction,
    getMatches,
    getPredictions,
    updatePrediction,
    type PredictionInput,
    type PredictionWithMatch,
} from "../../lib/admin";
import type { Match } from "../../types/match";

const PREDICTION_TYPES = ["1X2", "BTTS", "Over/Under", "VIP Pick"];

const emptyForm = (): PredictionInput & { id?: string } => ({
    match_id: "",
    prediction_type: "1X2",
    prediction_text: "",
    confidence: 70,
    analysis: "",
    is_vip: false,
});

export default function AdminPredictions() {
    const [predictions, setPredictions] = useState<PredictionWithMatch[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [vipFilter, setVipFilter] = useState<"" | "vip" | "free">("");
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const [predRes, matchRes] = await Promise.all([getPredictions(), getMatches()]);
        setPredictions(predRes.data);
        setMatches(matchRes.data);
        if (predRes.error) setError(predRes.error);
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const matchesWithPrediction = useMemo(
        () => new Set(predictions.map((p) => p.match_id)),
        [predictions]
    );

    const availableMatches = useMemo(() => {
        if (form.id) return matches;
        return matches.filter((m) => !matchesWithPrediction.has(m.id));
    }, [matches, matchesWithPrediction, form.id]);

    const filtered = useMemo(() => {
        return predictions.filter((p) => {
            const q = search.toLowerCase();
            const fixture = p.match ? `${p.match.home_team} ${p.match.away_team}` : "";
            const matchSearch =
                !q ||
                p.prediction_text.toLowerCase().includes(q) ||
                p.prediction_type.toLowerCase().includes(q) ||
                fixture.toLowerCase().includes(q);
            const matchVip =
                vipFilter === "" ||
                (vipFilter === "vip" && p.is_vip) ||
                (vipFilter === "free" && !p.is_vip);
            return matchSearch && matchVip;
        });
    }, [predictions, search, vipFilter]);

    function openCreate() {
        setForm(emptyForm());
        setError(null);
        setModalOpen(true);
    }

    function openEdit(p: PredictionWithMatch) {
        setForm({
            id: p.id,
            match_id: p.match_id,
            prediction_type: p.prediction_type,
            prediction_text: p.prediction_text,
            confidence: p.confidence,
            analysis: p.analysis,
            is_vip: p.is_vip,
        });
        setError(null);
        setModalOpen(true);
    }

    async function handleSave(e: FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const payload: PredictionInput = {
            match_id: form.match_id,
            prediction_type: form.prediction_type,
            prediction_text: form.prediction_text.trim(),
            confidence: Number(form.confidence),
            analysis: form.analysis.trim(),
            is_vip: form.is_vip,
        };

        const result = form.id
            ? await updatePrediction(form.id, payload)
            : await createPrediction(payload);

        setSaving(false);
        if (result.error) {
            setError(result.error);
            return;
        }
        setModalOpen(false);
        load();
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this prediction?")) return;
        const { error: e } = await deletePrediction(id);
        if (e) alert(e);
        else load();
    }

    async function toggleVip(p: PredictionWithMatch) {
        const { error: e } = await updatePrediction(p.id, { is_vip: !p.is_vip });
        if (e) alert(e);
        else load();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">One prediction per match · {filtered.length} total</p>
                <AdminBtn onClick={openCreate}>+ Add Prediction</AdminBtn>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    type="search"
                    placeholder="Search prediction or fixture…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                />
                <select
                    value={vipFilter}
                    onChange={(e) => setVipFilter(e.target.value as "" | "vip" | "free")}
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white"
                >
                    <option value="">All types</option>
                    <option value="vip">VIP only</option>
                    <option value="free">Free only</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-violet-500/10 bg-[#0c0e14]/80">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
                                <th className="px-4 py-3">Fixture</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Prediction</th>
                                <th className="px-4 py-3">Conf.</th>
                                <th className="px-4 py-3">VIP</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No predictions found</td></tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 text-white">
                                            {p.match ? `${p.match.home_team} vs ${p.match.away_team}` : "—"}
                                            <span className="block text-xs text-slate-500">{p.match?.league}</span>
                                        </td>
                                        <td className="px-4 py-3 text-violet-300">{p.prediction_type}</td>
                                        <td className="max-w-[200px] truncate px-4 py-3 text-slate-300">{p.prediction_text}</td>
                                        <td className="px-4 py-3 font-bold text-cyan-300">{Math.round(p.confidence)}%</td>
                                        <td className="px-4 py-3">
                                            <button type="button" onClick={() => toggleVip(p)} className={`rounded-md border px-2 py-0.5 text-xs font-bold ${p.is_vip ? "border-amber-400/40 bg-amber-500/15 text-amber-200" : "border-white/10 text-slate-500"}`}>
                                                {p.is_vip ? "VIP" : "Free"}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button type="button" onClick={() => openEdit(p)} className="mr-2 text-cyan-400">Edit</button>
                                            <button type="button" onClick={() => handleDelete(p.id)} className="text-rose-400">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? "Edit Prediction" : "Add Prediction"} wide>
                <form onSubmit={handleSave} className="space-y-4">
                    {error && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Match</label>
                        <select value={form.match_id} onChange={(e) => setForm((f) => ({ ...f, match_id: e.target.value }))} required disabled={Boolean(form.id)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white disabled:opacity-60">
                            <option value="">Select match…</option>
                            {(form.id ? matches.filter((m) => m.id === form.match_id) : availableMatches).map((m) => (
                                <option key={m.id} value={m.id}>{m.home_team} vs {m.away_team} — {m.league}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Type</label>
                        <select value={form.prediction_type} onChange={(e) => setForm((f) => ({ ...f, prediction_type: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white">
                            {PREDICTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <AdminInput id="ptext" label="Prediction text" value={form.prediction_text} onChange={(v) => setForm((f) => ({ ...f, prediction_text: v }))} required />
                    <AdminInput id="conf" label="Confidence (0–100)" type="number" value={form.confidence} onChange={(v) => setForm((f) => ({ ...f, confidence: Number(v) }))} required />
                    <AdminInput id="analysis" label="AI Analysis" as="textarea" rows={4} value={form.analysis} onChange={(v) => setForm((f) => ({ ...f, analysis: v }))} required />
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                        <input type="checkbox" checked={form.is_vip} onChange={(e) => setForm((f) => ({ ...f, is_vip: e.target.checked }))} className="h-4 w-4" />
                        <span className="text-sm font-medium text-amber-200">VIP prediction</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                        <AdminBtn type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</AdminBtn>
                        <AdminBtn variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminBtn>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
