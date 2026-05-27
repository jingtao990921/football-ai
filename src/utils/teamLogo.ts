const TEAM_LOGO_OVERRIDES: Record<string, string> = {
    arsenal:
        "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    chelsea:
        "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
    "manchester united":
        "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
    "manchester city":
        "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    liverpool:
        "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
    "real madrid":
        "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    barcelona:
        "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    "bayern munich":
        "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
    "paris saint-germain":
        "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
    psg: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
};

function normalizeTeamName(name: string): string {
    return name.trim().toLowerCase();
}

/** Placeholder logo API — falls back to ui-avatars for unknown teams */
export function getTeamLogoUrl(teamName: string): string {
    const key = normalizeTeamName(teamName);
    const override = TEAM_LOGO_OVERRIDES[key];
    if (override) return override;

    const initials = teamName
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 3)
        .toUpperCase();

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=128&background=0f172a&color=22d3ee&bold=true&format=png`;
}
