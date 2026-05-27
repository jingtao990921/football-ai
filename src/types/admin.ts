export type AdminProfile = {
    id: string;
    email: string;
    username?: string | null;
    role?: string | null;
    vip_status?: boolean | null;
    created_at?: string | null;
};
