import { supabase } from "../supabase/client";
import type { Match } from "../types/match";
import type { Prediction } from "../types/prediction";
import type { AdminProfile } from "../types/admin";

export type AdminResult<T> = { data: T; error: string | null };

function err(message: string | undefined): string {
    return message ?? "Unknown error";
}

// ─── Matches ───────────────────────────────────────────────────────────────

export type MatchInput = {
    home_team: string;
    away_team: string;
    league: string;
    match_time: string;
    status?: string | null;
};

export async function getMatches(): Promise<AdminResult<Match[]>> {
    const { data, error } = await supabase
        .from("matches")
        .select("id, home_team, away_team, league, match_time, status")
        .order("match_time", { ascending: false });
    return { data: (data ?? []) as Match[], error: error ? err(error.message) : null };
}

export async function createMatch(
    input: MatchInput
): Promise<AdminResult<Match>> {
    const { data, error } = await supabase
        .from("matches")
        .insert(input)
        .select("id, home_team, away_team, league, match_time, status")
        .single();
    return {
        data: data as Match,
        error: error ? err(error.message) : null,
    };
}

export async function updateMatch(
    id: string,
    input: Partial<MatchInput>
): Promise<AdminResult<Match>> {
    const { data, error } = await supabase
        .from("matches")
        .update(input)
        .eq("id", id)
        .select("id, home_team, away_team, league, match_time, status")
        .single();
    return {
        data: data as Match,
        error: error ? err(error.message) : null,
    };
}

export async function deleteMatch(id: string): Promise<AdminResult<null>> {
    const { error } = await supabase.from("matches").delete().eq("id", id);
    return { data: null, error: error ? err(error.message) : null };
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export type PredictionWithMatch = Prediction & {
    match?: { home_team: string; away_team: string; league: string } | null;
};

export type PredictionInput = {
    match_id: string;
    prediction_type: string;
    prediction_text: string;
    confidence: number;
    analysis: string;
    is_vip: boolean;
};

export async function getPredictions(): Promise<
    AdminResult<PredictionWithMatch[]>
> {
    const { data, error } = await supabase
        .from("predictions")
        .select(
            `
            id, match_id, prediction_type, prediction_text, confidence, analysis, is_vip, created_at,
            match:matches ( home_team, away_team, league )
        `
        )
        .order("created_at", { ascending: false });

    if (error) {
        return { data: [], error: err(error.message) };
    }

    const rows = (data ?? []).map((row) => {
        const r = row as Prediction & {
            match: PredictionWithMatch["match"] | PredictionWithMatch["match"][];
        };
        const match = Array.isArray(r.match) ? r.match[0] : r.match;
        return { ...r, match: match ?? null };
    });

    return { data: rows, error: null };
}

export async function getPredictionByMatchId(
    matchId: string,
    excludeId?: string
): Promise<AdminResult<Prediction | null>> {
    let query = supabase
        .from("predictions")
        .select("id, match_id, prediction_type, prediction_text, confidence, analysis, is_vip, created_at")
        .eq("match_id", matchId);

    if (excludeId) {
        query = query.neq("id", excludeId);
    }

    const { data, error } = await query.maybeSingle();
    return {
        data: (data as Prediction) ?? null,
        error: error ? err(error.message) : null,
    };
}

export async function createPrediction(
    input: PredictionInput
): Promise<AdminResult<Prediction>> {
    const existing = await getPredictionByMatchId(input.match_id);
    if (existing.data) {
        return {
            data: null as unknown as Prediction,
            error: "This match already has a prediction. Edit or delete it first.",
        };
    }

    const { data, error } = await supabase
        .from("predictions")
        .insert(input)
        .select(
            "id, match_id, prediction_type, prediction_text, confidence, analysis, is_vip, created_at"
        )
        .single();

    return {
        data: data as Prediction,
        error: error ? err(error.message) : null,
    };
}

export async function updatePrediction(
    id: string,
    input: Partial<PredictionInput>
): Promise<AdminResult<Prediction>> {
    if (input.match_id) {
        const existing = await getPredictionByMatchId(input.match_id, id);
        if (existing.data) {
            return {
                data: null as unknown as Prediction,
                error: "Target match already has another prediction.",
            };
        }
    }

    const { data, error } = await supabase
        .from("predictions")
        .update(input)
        .eq("id", id)
        .select(
            "id, match_id, prediction_type, prediction_text, confidence, analysis, is_vip, created_at"
        )
        .single();

    return {
        data: data as Prediction,
        error: error ? err(error.message) : null,
    };
}

export async function deletePrediction(
    id: string
): Promise<AdminResult<null>> {
    const { error } = await supabase.from("predictions").delete().eq("id", id);
    return { data: null, error: error ? err(error.message) : null };
}

// ─── Users (profiles) ────────────────────────────────────────────────────────

export async function getUsers(): Promise<AdminResult<AdminProfile[]>> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, email, username, role, vip_status, created_at")
        .order("created_at", { ascending: false });

    return {
        data: (data ?? []) as AdminProfile[],
        error: error ? err(error.message) : null,
    };
}

export async function updateUserRole(
    id: string,
    role: string
): Promise<AdminResult<AdminProfile>> {
    const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id)
        .select("id, email, username, role, vip_status, created_at")
        .single();

    return {
        data: data as AdminProfile,
        error: error ? err(error.message) : null,
    };
}

export async function updateVipStatus(
    id: string,
    vip_status: boolean
): Promise<AdminResult<AdminProfile>> {
    const { data, error } = await supabase
        .from("profiles")
        .update({ vip_status })
        .eq("id", id)
        .select("id, email, username, role, vip_status, created_at")
        .single();

    return {
        data: data as AdminProfile,
        error: error ? err(error.message) : null,
    };
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export type AdminStats = {
    matches: number;
    predictions: number;
    users: number;
    vipUsers: number;
};

export async function getAdminStats(): Promise<AdminResult<AdminStats>> {
    const [matches, predictions, users] = await Promise.all([
        supabase.from("matches").select("id", { count: "exact", head: true }),
        supabase.from("predictions").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id, vip_status"),
    ]);

    const userRows = users.data ?? [];
    return {
        data: {
            matches: matches.count ?? 0,
            predictions: predictions.count ?? 0,
            users: userRows.length,
            vipUsers: userRows.filter((u) => u.vip_status).length,
        },
        error: null,
    };
}
