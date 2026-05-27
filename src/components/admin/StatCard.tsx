type StatCardProps = {
    label: string;
    value: number | string;
    accent?: "cyan" | "violet" | "amber" | "emerald";
};

const accents = {
    cyan: "border-cyan-500/25 from-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.1)]",
    violet: "border-violet-500/25 from-violet-500/10 shadow-[0_0_24px_rgba(139,92,246,0.1)]",
    amber: "border-amber-500/25 from-amber-500/10 shadow-[0_0_24px_rgba(251,191,36,0.1)]",
    emerald: "border-emerald-500/25 from-emerald-500/10 shadow-[0_0_24px_rgba(52,211,153,0.1)]",
};

export default function StatCard({
    label,
    value,
    accent = "cyan",
}: StatCardProps) {
    return (
        <div
            className={`rounded-2xl border bg-gradient-to-br to-transparent p-5 transition-all duration-300 hover:-translate-y-0.5 ${accents[accent]}`}
        >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {label}
            </p>
            <p className="mt-2 text-3xl font-extrabold tabular-nums text-white">
                {value}
            </p>
        </div>
    );
}
