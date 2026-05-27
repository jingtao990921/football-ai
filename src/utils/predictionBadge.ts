export type BadgeVariant = "1x2" | "btts" | "over_under" | "vip" | "default";

export function getBadgeVariant(type: string, isVip?: boolean): BadgeVariant {
    if (isVip || type.toLowerCase().includes("vip")) return "vip";
    const t = type.toLowerCase().replace(/\s+/g, "");
    if (t === "1x2" || t.includes("1x2")) return "1x2";
    if (t === "btts" || t.includes("btts")) return "btts";
    if (t.includes("over") || t.includes("under") || t.includes("o/u"))
        return "over_under";
    return "default";
}

export const BADGE_STYLES: Record<BadgeVariant, string> = {
    "1x2": "border-blue-400/40 bg-blue-500/15 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.15)]",
    btts: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.15)]",
    over_under:
        "border-violet-400/40 bg-violet-500/15 text-violet-200 shadow-[0_0_12px_rgba(139,92,246,0.15)]",
    vip: "border-amber-400/50 bg-amber-500/20 text-amber-100 shadow-[0_0_14px_rgba(251,191,36,0.2)]",
    default:
        "border-cyan-400/35 bg-cyan-500/10 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.12)]",
};
