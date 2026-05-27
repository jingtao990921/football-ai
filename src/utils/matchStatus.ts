export type MatchStatus = "upcoming" | "live" | "finished";

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

export function resolveMatchStatus(
    matchTime: string,
    dbStatus?: string | null
): MatchStatus {
    if (dbStatus) {
        const s = dbStatus.toLowerCase();
        if (s === "live" || s === "in_play" || s === "in play") return "live";
        if (
            s === "finished" ||
            s === "ft" ||
            s === "ended" ||
            s === "completed"
        )
            return "finished";
        if (s === "upcoming" || s === "scheduled" || s === "ns") return "upcoming";
    }

    const kickoff = new Date(matchTime).getTime();
    const now = Date.now();

    if (now < kickoff) return "upcoming";
    if (now < kickoff + MATCH_DURATION_MS) return "live";
    return "finished";
}

export const STATUS_LABELS: Record<MatchStatus, string> = {
    upcoming: "Upcoming",
    live: "Live",
    finished: "Finished",
};

export const STATUS_STYLES: Record<
    MatchStatus,
    { badge: string; dot: string }
> = {
    upcoming: {
        badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
        dot: "bg-cyan-400",
    },
    live: {
        badge: "bg-rose-500/15 text-rose-300 border-rose-500/40",
        dot: "bg-rose-500 animate-pulse-glow",
    },
    finished: {
        badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",
        dot: "bg-slate-500",
    },
};
