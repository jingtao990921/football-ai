export type Match = {
    id: string;
    home_team: string;
    away_team: string;
    league: string;
    match_time: string;
    status?: string | null;
    /** From API-Football (display only, not stored in DB) */
    home_score?: number | null;
    away_score?: number | null;
};
