export function deriveUsername(email: string, userId?: string): string {
    const local = email.split("@")[0] ?? "";
    let base = local.replace(/[^a-zA-Z0-9_]/g, "");
    if (base.length < 2) {
        base = `user_${(userId ?? "00000000").replace(/-/g, "").slice(0, 8)}`;
    }
    return base.slice(0, 30);
}
