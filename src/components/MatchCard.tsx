import TeamLogo from "./TeamLogo";
import PredictionCard from "./PredictionCard";
import type { Prediction } from "../types/prediction";
import type { Match } from "../types/match";
import {
    resolveMatchStatus,
    STATUS_LABELS,
    STATUS_STYLES,
    type MatchStatus,
} from "../utils/matchStatus";

export type { Match };

export type MatchCardData = Match & {
    predictions?: Prediction[];
};

type MatchCardProps = {
    match: MatchCardData;
};

function formatMatchTime(iso: string): { date: string; time: string } {
    const d = new Date(iso);
    return {
        date: d.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
        }),
        time: d.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        }),
    };
}

export default function MatchCard({ match }: MatchCardProps) {
    const status: MatchStatus = resolveMatchStatus(
        match.match_time,
        match.status
    );
    const styles = STATUS_STYLES[status];
    const { date, time } = formatMatchTime(match.match_time);

    return (
        <article
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-[#0c0e14] to-[#080a10] p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_40px_rgba(34,211,238,0.12)] sm:p-5"
        >
            <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        "radial-gradient(600px circle at 50% 0%, rgba(34,211,238,0.08), transparent 60%)",
                }}
                aria-hidden
            />

            <div className="relative flex items-start justify-between gap-3">
                <span className="truncate text-xs font-semibold uppercase tracking-wider text-cyan-400/90">
                    {match.league || "League TBD"}
                </span>
                <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${styles.badge}`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                    {STATUS_LABELS[status]}
                </span>
            </div>

            <div className="relative mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
                    <TeamLogo teamName={match.home_team} />
                    <p className="line-clamp-2 text-sm font-semibold text-white sm:text-base">
                        {match.home_team}
                    </p>
                </div>

                <div className="flex flex-col items-center px-1">
                    {match.home_score != null && match.away_score != null ? (
                        <span className="text-xl font-black tabular-nums text-white sm:text-2xl">
                            {match.home_score}
                            <span className="mx-1 text-slate-600">-</span>
                            {match.away_score}
                        </span>
                    ) : (
                        <span className="text-lg font-black text-slate-600 sm:text-xl">
                            VS
                        </span>
                    )}
                    {status === "live" && (
                        <span className="mt-1 text-[10px] font-bold text-rose-400">
                            LIVE
                        </span>
                    )}
                </div>

                <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
                    <TeamLogo teamName={match.away_team} />
                    <p className="line-clamp-2 text-sm font-semibold text-white sm:text-base">
                        {match.away_team}
                    </p>
                </div>
            </div>

            <PredictionCard predictions={match.predictions ?? []} />

            <div className="relative mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500">{date}</span>
                    <span className="text-sm font-semibold text-slate-200">
                        {time}
                    </span>
                </div>
            </div>
        </article>
    );
}
