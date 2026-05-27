export type UserProfile = {
    id: string;
    email: string;
    username: string;
    avatar_url?: string | null;
    role?: string | null;
    vip_status?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
};
