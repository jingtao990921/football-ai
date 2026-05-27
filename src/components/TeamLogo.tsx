import { useState } from "react";
import { getTeamLogoUrl } from "../utils/teamLogo";

type TeamLogoProps = {
    teamName: string;
    size?: "sm" | "md" | "lg";
};

const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10 sm:h-12 sm:w-12",
    lg: "h-14 w-14",
};

export default function TeamLogo({ teamName, size = "md" }: TeamLogoProps) {
    const [failed, setFailed] = useState(false);
    const initials = teamName
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    if (failed) {
        return (
            <div
                className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-full border border-cyan-500/20 bg-slate-900 text-xs font-bold text-cyan-300`}
                aria-label={teamName}
            >
                {initials}
            </div>
        );
    }

    return (
        <img
            src={getTeamLogoUrl(teamName)}
            alt={`${teamName} logo`}
            className={`${sizeClasses[size]} shrink-0 rounded-full border border-white/10 bg-slate-900 object-contain p-1`}
            onError={() => setFailed(true)}
            loading="lazy"
        />
    );
}
