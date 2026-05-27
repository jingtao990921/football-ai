import { useAuth } from "../context/AuthContext";
import type { Prediction } from "../types/prediction";
import {
    canViewPrediction,
    pickLatestPrediction,
} from "../types/prediction";
import PredictionBadge from "./PredictionBadge";
import ConfidenceBar from "./ConfidenceBar";
import VIPOverlay from "./VIPOverlay";

type PredictionCardProps = {
    predictions: Prediction[];
    className?: string;
};

function EmptyState() {
    return (
        <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-500">
                <svg
                    className="h-4 w-4 shrink-0 opacity-60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
                <p className="text-xs font-medium sm:text-sm">
                    No AI prediction yet
                </p>
            </div>
        </div>
    );
}

type PredictionContentProps = {
    prediction: Prediction;
    locked: boolean;
};

function PredictionContent({ prediction, locked }: PredictionContentProps) {
    const body = (
        <div className="space-y-3">
            <p className="text-sm font-bold leading-snug text-white sm:text-base">
                {prediction.prediction_text}
            </p>
            <ConfidenceBar confidence={prediction.confidence} />
            <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2.5 backdrop-blur-sm">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    AI Analysis
                </p>
                <p className="line-clamp-3 text-xs leading-relaxed text-slate-400 sm:text-sm">
                    {prediction.analysis}
                </p>
            </div>
        </div>
    );

    if (!locked) return body;

    return (
        <div className="relative min-h-[120px] sm:min-h-[128px]">
            <div
                className="space-y-3 select-none blur-[7px] pointer-events-none"
                aria-hidden
            >
                {body}
            </div>
            <VIPOverlay message="VIP Prediction Locked" />
        </div>
    );
}

export default function PredictionCard({
    predictions,
    className = "",
}: PredictionCardProps) {
    const { isVip } = useAuth();
    const prediction = pickLatestPrediction(predictions);

    if (!prediction) {
        return <EmptyState />;
    }

    const unlocked = canViewPrediction(prediction, isVip);
    const locked = !unlocked;

    return (
        <section
            className={`group/pred relative mt-4 overflow-hidden rounded-xl border p-4 backdrop-blur-md transition-all duration-300 sm:p-4 ${className} ${
                locked
                    ? "border-amber-500/25 bg-gradient-to-br from-amber-950/20 via-[#0c0e14]/90 to-[#080a10]/90 hover:border-amber-400/45 hover:shadow-[0_0_32px_rgba(251,191,36,0.1)]"
                    : "border-violet-500/20 bg-gradient-to-br from-violet-950/15 via-[#0c0e14]/80 to-[#080a10]/90 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-[0_0_36px_rgba(34,211,238,0.14)]"
            }`}
        >
            {/* Glass highlight */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/pred:opacity-100"
                aria-hidden
                style={{
                    background: locked
                        ? "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(251,191,36,0.1), transparent)"
                        : "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.14), transparent)",
                }}
            />

            <header className="relative mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-300/90 sm:text-xs">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-40" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
                        </span>
                        AI Prediction
                    </span>
                    <PredictionBadge
                        type={prediction.prediction_type}
                        vip={prediction.is_vip}
                    />
                </div>
            </header>

            <div className="relative">
                <PredictionContent prediction={prediction} locked={locked} />
            </div>
        </section>
    );
}
