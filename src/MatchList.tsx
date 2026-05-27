import { useCallback, useEffect, useMemo, useState } from "react";
import MatchCard from "./components/MatchCard";
import { LIVE_DATA_UNAVAILABLE } from "./lib/footballApi";
import { loadLiveMatches, type LiveMatch } from "./services/liveMatches";
import { resolveMatchStatus, type MatchStatus } from "./utils/matchStatus";

type FilterTab = "all" | MatchStatus;

const FILTER_TABS: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "live", label: "Live" },
    { id: "upcoming", label: "Upcoming" },
    { id: "finished", label: "Finished" },
];

const REFRESH_MS = 5 * 60 * 1000;

function MatchCardSkeleton() {
    return (
        <div className="rounded-2xl border border-white/5 bg-[#0c0e14] p-5">
            <div className="skeleton-shimmer mb-4 h-4 w-24 rounded" />
            <div className="flex justify-between gap-4">
                <div className="skeleton-shimmer h-12 w-12 rounded-full" />
                <div className="skeleton-shimmer h-12 w-12 rounded-full" />
            </div>
            <div className="skeleton-shimmer mt-4 h-20 w-full rounded-xl" />
        </div>
    );
}

export default function MatchList() {
    const [matches, setMatches] = useState<LiveMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiUnavailable, setApiUnavailable] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [filter, setFilter] = useState<FilterTab>("all");

    const load = useCallback(async () => {
        const result = await loadLiveMatches();

        if (!result.apiOk && result.matches.length === 0) {
            setApiUnavailable(true);
            setMatches([]);
        } else {
            setApiUnavailable(false);
            setMatches(result.matches);
        }

        setLastUpdated(new Date());
        setLoading(false);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setLoading(true);
            await load();
        };

        void run();

        const interval = window.setInterval(() => {
            if (!cancelled) void load();
        }, REFRESH_MS);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [load]);

    const filteredMatches = useMemo(() => {
        if (filter === "all") return matches;
        return matches.filter(
            (m) => resolveMatchStatus(m.match_time, m.status) === filter
        );
    }, [matches, filter]);

    const counts = useMemo(() => {
        const c = { all: matches.length, live: 0, upcoming: 0, finished: 0 };
        for (const m of matches) {
            c[resolveMatchStatus(m.match_time, m.status)]++;
        }
        return c;
    }, [matches]);

    return (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="mb-8 text-center sm:mb-10 sm:text-left">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
                    API-Football Live Feed
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Today&apos;s{" "}
                    <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                        Matches
                    </span>
                </h1>
                {lastUpdated && !loading && (
                    <p className="mt-2 text-xs text-slate-500">
                        Updated {lastUpdated.toLocaleTimeString()} · refreshes
                        every 5 min
                    </p>
                )}
            </div>

            {apiUnavailable && !loading && (
                <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-center text-amber-200">
                    {LIVE_DATA_UNAVAILABLE}
                </div>
            )}

            <div className="mb-6 flex flex-wrap gap-2 sm:mb-8">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilter(tab.id)}
                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                            filter === tab.id
                                ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-300"
                                : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                        }`}
                    >
                        {tab.label} ({counts[tab.id]})
                    </button>
                ))}
            </div>

            {loading && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <MatchCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {!loading && apiUnavailable && filteredMatches.length === 0 && (
                <div className="rounded-2xl border border-dashed border-amber-500/20 px-6 py-16 text-center text-slate-500">
                    {LIVE_DATA_UNAVAILABLE}
                </div>
            )}

            {!loading && !apiUnavailable && filteredMatches.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-slate-500">
                    No matches for today
                </div>
            )}

            {!loading && filteredMatches.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredMatches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            )}
        </section>
    );
}
