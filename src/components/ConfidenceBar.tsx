import { normalizeConfidence } from "../types/prediction";

type ConfidenceBarProps = {
    confidence: number;
    className?: string;
    glow?: boolean;
};

function barGradient(pct: number): string {
    if (pct >= 75) return "from-emerald-400 via-cyan-400 to-teal-300";
    if (pct >= 50) return "from-cyan-400 via-blue-400 to-indigo-400";
    return "from-amber-400 via-orange-400 to-rose-400";
}

function glowColor(pct: number): string {
    if (pct >= 75) return "rgba(52,211,153,0.55)";
    if (pct >= 50) return "rgba(34,211,238,0.55)";
    return "rgba(251,146,60,0.5)";
}

export default function ConfidenceBar({
    confidence,
    className = "",
    glow = true,
}: ConfidenceBarProps) {
    const pct = normalizeConfidence(confidence);

    return (
        <div className={className}>
            <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-500">
                    Confidence
                </span>
                <span
                    className={`font-extrabold tabular-nums ${
                        pct >= 75
                            ? "text-emerald-300"
                            : pct >= 50
                              ? "text-cyan-300"
                              : "text-amber-300"
                    }`}
                >
                    {pct}%
                </span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-sm">
                {glow && (
                    <div
                        className="absolute inset-y-0 left-0 rounded-full opacity-60 blur-sm transition-all duration-700"
                        style={{
                            width: `${pct}%`,
                            background: glowColor(pct),
                        }}
                        aria-hidden
                    />
                )}
                <div
                    className={`relative h-full rounded-full bg-gradient-to-r ${barGradient(pct)} transition-all duration-700 ease-out`}
                    style={{
                        width: `${pct}%`,
                        boxShadow: glow
                            ? `0 0 14px ${glowColor(pct)}, 0 0 4px ${glowColor(pct)}`
                            : undefined,
                    }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${pct}% confidence`}
                />
            </div>
        </div>
    );
}
