import {
    fetchFootballFixtures,
    syncFixturesToSupabase,
    type FootballFixture,
} from "../lib/footballApi";
import {
    fetchMatchesWithPredictions,
    type MatchWithPredictions,
} from "./matches";

export type LiveMatch = MatchWithPredictions & {
    home_score?: number | null;
    away_score?: number | null;
};

function mergeFixturesWithDb(
    apiFixtures: FootballFixture[],
    dbMatches: MatchWithPredictions[]
): LiveMatch[] {
    const usedDbIds = new Set<string>();

    const merged: LiveMatch[] = apiFixtures.map((api) => {
        const db =
            dbMatches.find(
                (m) =>
                    m.home_team === api.home_team &&
                    m.away_team === api.away_team
            ) ??
            dbMatches.find(
                (m) =>
                    m.home_team === api.home_team &&
                    m.away_team === api.away_team &&
                    m.league === api.league
            );

        if (db) usedDbIds.add(db.id);

        return {
            id: db?.id ?? `live-${api.fixtureId}`,
            home_team: api.home_team,
            away_team: api.away_team,
            league: api.league,
            match_time: api.match_time,
            status: api.status,
            home_score: api.home_score,
            away_score: api.away_score,
            predictions: db?.predictions ?? [],
        };
    });

    for (const db of dbMatches) {
        if (!usedDbIds.has(db.id)) {
            merged.push({ ...db, home_score: null, away_score: null });
        }
    }

    return merged.sort(
        (a, b) =>
            new Date(a.match_time).getTime() - new Date(b.match_time).getTime()
    );
}

export type LoadLiveMatchesResult = {
    matches: LiveMatch[];
    apiOk: boolean;
    error: string | null;
};

const SYNC_CAP = 40;
const DB_FETCH_MS = 8000;

function withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    fallback: T
): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => {
            window.setTimeout(() => resolve(fallback), ms);
        }),
    ]);
}

/** Fetch API → show immediately → background sync + predictions merge */
export async function loadLiveMatches(): Promise<LoadLiveMatchesResult> {
    try {
        const fixtures = await fetchFootballFixtures();

        void syncFixturesToSupabase(fixtures.slice(0, SYNC_CAP)).catch((err) => {
            console.warn("[API-Football] Background sync failed:", err);
        });

        const { data: dbMatches, error: dbError } = await withTimeout(
            fetchMatchesWithPredictions(),
            DB_FETCH_MS,
            { data: [], error: "timeout" }
        );

        if (dbError) {
            return {
                matches: mergeFixturesWithDb(fixtures, []),
                apiOk: true,
                error: null,
            };
        }

        return {
            matches: mergeFixturesWithDb(fixtures, dbMatches),
            apiOk: true,
            error: null,
        };
    } catch (apiErr) {
        console.error("[API-Football] loadLiveMatches failed:", apiErr);
        if (apiErr instanceof Error && "url" in apiErr) {
            console.error("[API-Football] details:", {
                message: apiErr.message,
                url: (apiErr as { url?: string }).url,
                status: (apiErr as { status?: number }).status,
                body: (apiErr as { body?: string }).body,
            });
        }

        const { data: dbMatches, error: dbError } =
            await fetchMatchesWithPredictions();

        if (!dbError && dbMatches.length > 0) {
            return {
                matches: dbMatches.map((m) => ({
                    ...m,
                    home_score: null,
                    away_score: null,
                })),
                apiOk: false,
                error: null,
            };
        }

        const message =
            apiErr instanceof Error ? apiErr.message : "API request failed";
        return {
            matches: [],
            apiOk: false,
            error: message,
        };
    }
}
