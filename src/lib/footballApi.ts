import { supabase } from "../supabase/client";

/** Normalized fixture from API-Football */
export type FootballFixture = {
    fixtureId: number;
    home_team: string;
    away_team: string;
    league: string;
    match_time: string;
    status: "upcoming" | "live" | "finished";
    home_score: number | null;
    away_score: number | null;
};

type ApiFootballResponse = {
    response?: ApiFixtureRow[];
    errors?: Record<string, string> | string[];
};

type ApiFixtureRow = {
    fixture: {
        id: number;
        date: string;
        status: { short: string };
    };
    league: { name: string };
    teams: {
        home: { name: string };
        away: { name: string };
    };
    goals: {
        home: number | null;
        away: number | null;
    };
};

const LIVE_STATUS = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"]);
const FINISHED_STATUS = new Set([
    "FT",
    "AET",
    "PEN",
    "AOT",
    "CANC",
    "ABD",
    "AWD",
    "WO",
]);

function getApiConfig() {
    const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY as string | undefined;
    const apiKey = import.meta.env.VITE_API_FOOTBALL_KEY as string | undefined;
    const key = rapidApiKey || apiKey;

    const configuredBase =
        import.meta.env.VITE_API_FOOTBALL_BASE_URL as string | undefined;
    const baseUrl = import.meta.env.DEV
        ? "/api-football"
        : configuredBase || "https://v3.football.api-sports.io";

    const host =
        (import.meta.env.VITE_RAPIDAPI_HOST as string | undefined) ||
        "v3.football.api-sports.io";

    return { key, baseUrl, host, useRapidApi: Boolean(rapidApiKey) };
}

function mapApiStatus(short: string): FootballFixture["status"] {
    const code = short.toUpperCase();
    if (LIVE_STATUS.has(code)) return "live";
    if (FINISHED_STATUS.has(code)) return "finished";
    return "upcoming";
}

function mapFixtureRow(row: ApiFixtureRow): FootballFixture {
    return {
        fixtureId: row.fixture.id,
        home_team: row.teams.home.name,
        away_team: row.teams.away.name,
        league: row.league.name,
        match_time: row.fixture.date,
        status: mapApiStatus(row.fixture.status.short),
        home_score: row.goals.home,
        away_score: row.goals.away,
    };
}

function todayUtcDate(): string {
    return new Date().toISOString().slice(0, 10);
}

function dedupeFixtures(fixtures: FootballFixture[]): FootballFixture[] {
    const map = new Map<number, FootballFixture>();
    for (const f of fixtures) {
        map.set(f.fixtureId, f);
    }
    return Array.from(map.values());
}

export class FootballApiError extends Error {
    url: string;
    status?: number;
    body?: string;

    constructor(message: string, url: string, status?: number, body?: string) {
        super(message);
        this.name = "FootballApiError";
        this.url = url;
        this.status = status;
        this.body = body;
    }
}

async function apiFetch(path: string): Promise<ApiFootballResponse> {
    const { key, baseUrl, host, useRapidApi } = getApiConfig();

    if (!key) {
        throw new FootballApiError(
            "Missing API-Football key — set VITE_RAPIDAPI_KEY in .env",
            path
        );
    }

    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    // Direct api-sports.io accepts x-apisports-key; RapidAPI keys often work with both.
    headers["x-apisports-key"] = key;
    if (useRapidApi) {
        headers["x-rapidapi-key"] = key;
        headers["x-rapidapi-host"] = host;
    }

    const url = `${baseUrl.replace(/\/$/, "")}${path}`;

    let res: Response;
    try {
        res = await fetch(url, { headers });
    } catch (networkErr) {
        const msg =
            networkErr instanceof Error
                ? networkErr.message
                : "Network request failed";
        console.error("[API-Football] Network error:", { url, message: msg });
        throw new FootballApiError(`Network error: ${msg}`, url);
    }

    const bodyText = await res.text();

    if (!res.ok) {
        console.error("[API-Football] HTTP error:", {
            url,
            status: res.status,
            statusText: res.statusText,
            body: bodyText,
        });
        throw new FootballApiError(
            `HTTP ${res.status} ${res.statusText}`,
            url,
            res.status,
            bodyText
        );
    }

    let json: ApiFootballResponse;
    try {
        json = JSON.parse(bodyText) as ApiFootballResponse;
    } catch {
        console.error("[API-Football] Invalid JSON:", { url, body: bodyText });
        throw new FootballApiError("Invalid JSON response", url, res.status, bodyText);
    }

    if (json.errors) {
        const errText = Array.isArray(json.errors)
            ? json.errors.join(", ")
            : Object.values(json.errors).join(", ");
        const isPlanLimit =
            errText &&
            /free plan|do not have access|not available/i.test(errText);

        if (errText && !isPlanLimit) {
            console.error("[API-Football] API errors:", { url, errors: json.errors });
            throw new FootballApiError(errText, url, res.status, bodyText);
        }

        if (isPlanLimit) {
            console.warn("[API-Football] Plan limitation (non-fatal):", errText);
        }
    }

    return json;
}

function parseAllowedDatesFromPlanError(
    errors: ApiFootballResponse["errors"]
): string[] {
    if (!errors) return [];
    const text =
        typeof errors === "object" && !Array.isArray(errors)
            ? Object.values(errors).join(" ")
            : String(errors);
    const match = text.match(
        /from\s+(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/i
    );
    if (!match) return [];

    const dates: string[] = [];
    const start = new Date(`${match[1]}T00:00:00Z`);
    const end = new Date(`${match[2]}T00:00:00Z`);
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
        dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
}

async function fetchFixturesByDate(date: string): Promise<FootballFixture[]> {
    const res = await apiFetch(`/fixtures?date=${date}&timezone=UTC`);
    return (res.response ?? []).map(mapFixtureRow);
}

/** Fetch live + today (+ plan-allowed dates on free tier) from API-Football */
export async function fetchFootballFixtures(): Promise<FootballFixture[]> {
    const collected: FootballFixture[] = [];

    try {
        const liveRes = await apiFetch(`/fixtures?live=all`);
        collected.push(...(liveRes.response ?? []).map(mapFixtureRow));
        console.info(
            "[API-Football] Live fixtures:",
            liveRes.response?.length ?? 0
        );
    } catch (err) {
        console.error("[API-Football] Live fetch failed:", err);
    }

    const today = todayUtcDate();
    try {
        const todayRes = await apiFetch(`/fixtures?date=${today}&timezone=UTC`);
        const rows = (todayRes.response ?? []).map(mapFixtureRow);
        collected.push(...rows);

        if (rows.length === 0 && todayRes.errors) {
            const fallbackDates = parseAllowedDatesFromPlanError(
                todayRes.errors
            ).slice(0, 2);
            for (const d of fallbackDates) {
                try {
                    const extra = await fetchFixturesByDate(d);
                    collected.push(...extra);
                    console.info(
                        `[API-Football] Fallback date ${d}:`,
                        extra.length
                    );
                } catch (err) {
                    console.error(
                        `[API-Football] Fallback date ${d} failed:`,
                        err
                    );
                }
            }
        }
    } catch (err) {
        console.error("[API-Football] Today fetch failed:", err);
    }

    const result = dedupeFixtures(collected).sort(
        (a, b) =>
            new Date(a.match_time).getTime() - new Date(b.match_time).getTime()
    );

    if (result.length === 0) {
        throw new FootballApiError(
            "No fixtures returned (check API plan date limits)",
            "/fixtures"
        );
    }

    console.info("[API-Football] Total fixtures loaded:", result.length);
    return result;
}

type MatchRow = {
    home_team: string;
    away_team: string;
    league: string;
    match_time: string;
    status?: string;
};

async function upsertOneFixture(
    f: FootballFixture,
    includeStatus: boolean
): Promise<{ ok: boolean; error?: string }> {
    const { data: existing, error: findError } = await supabase
        .from("matches")
        .select("id")
        .eq("home_team", f.home_team)
        .eq("away_team", f.away_team)
        .eq("league", f.league)
        .limit(1);

    if (findError) {
        return { ok: false, error: findError.message };
    }

    const row: MatchRow = {
        home_team: f.home_team,
        away_team: f.away_team,
        league: f.league,
        match_time: f.match_time,
    };
    if (includeStatus) {
        row.status = f.status;
    }

    if (existing?.[0]?.id) {
        const { error: updateError } = await supabase
            .from("matches")
            .update(row)
            .eq("id", existing[0].id);
        if (updateError) return { ok: false, error: updateError.message };
        return { ok: true };
    }

    const { error: insertError } = await supabase.from("matches").insert(row);
    if (insertError) return { ok: false, error: insertError.message };
    return { ok: true };
}

/** Best-effort sync into Supabase matches (existing columns only) */
export async function syncFixturesToSupabase(
    fixtures: FootballFixture[]
): Promise<{ synced: number; errors: string[] }> {
    const errors: string[] = [];
    let synced = 0;

    for (const f of fixtures) {
        try {
            let result = await upsertOneFixture(f, true);

            if (
                !result.ok &&
                result.error &&
                /status|column/i.test(result.error)
            ) {
                result = await upsertOneFixture(f, false);
            }

            if (result.ok) synced++;
            else if (result.error) errors.push(result.error);
        } catch (err) {
            errors.push(err instanceof Error ? err.message : "Sync failed");
        }
    }

    if (errors.length > 0) {
        console.warn("[API-Football] Supabase sync warnings:", errors.slice(0, 5));
    }

    return { synced, errors };
}

export const LIVE_DATA_UNAVAILABLE = "Live data unavailable";
