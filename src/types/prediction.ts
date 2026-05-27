export type Prediction = {
    id: string;
    match_id: string;
    prediction_type: string;
    prediction_text: string;
    confidence: number;
    analysis: string;
    is_vip: boolean;
    created_at: string;
};

export function normalizeConfidence(value: number): number {
    if (value <= 1) return Math.round(value * 100);
    return Math.min(100, Math.max(0, Math.round(value)));
}

export function pickLatestPrediction(
    predictions: Prediction[] | null | undefined
): Prediction | null {
    if (!predictions?.length) return null;
    return [...predictions].sort(
        (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
}

export function canViewPrediction(
    prediction: Prediction,
    userIsVip: boolean
): boolean {
    if (!prediction.is_vip) return true;
    return userIsVip;
}
