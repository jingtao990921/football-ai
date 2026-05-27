import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MatchCard from "../components/MatchCard";
import { useAuth } from "../context/AuthContext";
import {
    fetchMatchesWithPredictions,
    type MatchWithPredictions,
} from "../services/matches";

export default function PredictionsPage() {
    const { isVip } = useAuth();
    const [matches, setMatches] = useState<MatchWithPredictions[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const timeout = window.setTimeout(() => {
            if (!cancelled) setLoading(false);
        }, 10000);

        fetchMatchesWithPredictions()
            .then(({ data, error: fetchError }) => {
                if (cancelled) return;
                if (fetchError) setError(fetchError);
                else setMatches(data.filter((m) => m.predictions.length > 0));
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Load failed");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
                window.clearTimeout(timeout);
            });

        return () => {
            cancelled = true;
            window.clearTimeout(timeout);
        };
    }, []);

    return (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="mb-10 text-center sm:text-left">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90">
                    AI Engine
                </p>
                <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                    AI{" "}
                    <span className="bg-gradient-to-r from-violet-300 to-cyan-400 bg-clip-text text-transparent">
                        Predictions
                    </span>
                </h1>
                <p className="mt-3 text-sm text-slate-400">
                    {isVip
                        ? "Full VIP access — all predictions unlocked."
                        : "Upgrade to VIP to unlock premium picks."}
                </p>
                {!isVip && (
                    <Link
                        to="/vip"
                        className="mt-4 inline-flex rounded-xl border border-amber-400/40 bg-amber-500/15 px-5 py-2.5 text-sm font-bold text-amber-200 hover:bg-amber-500/25"
                    >
                        Get VIP Access →
                    </Link>
                )}
            </div>

            {loading && (
                <p className="text-center text-slate-500">Loading predictions…</p>
            )}

            {!loading && error && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-8 text-center text-rose-300">
                    {error}
                </div>
            )}

            {!loading && !error && matches.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-slate-500">
                    No AI predictions available yet.
                </div>
            )}

            {!loading && !error && matches.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {matches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            )}
        </section>
    );
}
