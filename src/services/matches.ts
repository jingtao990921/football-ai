import { supabase } from "../supabase/client";
import type { Prediction } from "../types/prediction";
import type { Match } from "../types/match";

export type MatchWithPredictions = Match & {
    predictions: Prediction[];
};

type MatchRow = Match & {
    predictions: Prediction[] | Prediction | null;
};

function normalizePredictions(
    raw: Prediction[] | Prediction | null | undefined
): Prediction[] {
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
}

export async function fetchMatchesWithPredictions(): Promise<{
    data: MatchWithPredictions[];
    error: string | null;
}> {
    const { data, error } = await supabase
        .from("matches")
        .select(
            `
            id,
            home_team,
            away_team,
            league,
            match_time,
            status,
            predictions (
                id,
                match_id,
                prediction_type,
                prediction_text,
                confidence,
                analysis,
                is_vip,
                created_at
            )
        `
        )
        .order("match_time", { ascending: true });

    if (error) {
        return await fetchMatchesWithPredictionsFallback();
    }

    const rows = (data ?? []) as MatchRow[];
    return {
        data: rows.map((row) => ({
            id: row.id,
            home_team: row.home_team,
            away_team: row.away_team,
            league: row.league,
            match_time: row.match_time,
            status: row.status,
            predictions: normalizePredictions(row.predictions),
        })),
        error: null,
    };
}

async function fetchMatchesWithPredictionsFallback(): Promise<{
    data: MatchWithPredictions[];
    error: string | null;
}> {
    const [matchesRes, predictionsRes] = await Promise.all([
        supabase
            .from("matches")
            .select("id, home_team, away_team, league, match_time, status")
            .order("match_time", { ascending: true }),
        supabase
            .from("predictions")
            .select(
                "id, match_id, prediction_type, prediction_text, confidence, analysis, is_vip, created_at"
            ),
    ]);

    if (matchesRes.error) {
        return { data: [], error: matchesRes.error.message };
    }

    const predictionsByMatch = new Map<string, Prediction[]>();
    for (const p of (predictionsRes.data ?? []) as Prediction[]) {
        const list = predictionsByMatch.get(p.match_id) ?? [];
        list.push(p);
        predictionsByMatch.set(p.match_id, list);
    }

    const matches = (matchesRes.data ?? []) as Match[];
    return {
        data: matches.map((m) => ({
            ...m,
            predictions: predictionsByMatch.get(m.id) ?? [],
        })),
        error: null,
    };
}
