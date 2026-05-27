import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";
import type { UserProfile } from "../types/profile";
import { deriveUsername } from "../utils/profile";

type AuthContextValue = {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
    isVip: boolean;
    isAdmin: boolean;
    signIn: (
        email: string,
        password: string
    ) => Promise<{ error: string | null; profile: UserProfile | null }>;
    signUp: (
        email: string,
        password: string
    ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const PROFILE_SELECT =
    "id, email, username, avatar_url, role, vip_status, created_at, updated_at";

const LOADING_TIMEOUT_MS = 8000;

async function fetchProfile(userId: string): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select(PROFILE_SELECT)
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            console.warn("Profile fetch:", error.message);
            return null;
        }
        return data as UserProfile | null;
    } catch (err) {
        console.warn("Profile fetch exception:", err);
        return null;
    }
}

async function ensureProfile(user: User): Promise<UserProfile | null> {
    const existing = await fetchProfile(user.id);
    if (existing?.username) return existing;

    const email = user.email ?? "";
    const username =
        (user.user_metadata?.username as string | undefined) ||
        deriveUsername(email, user.id);

    try {
        const { data, error } = await supabase
            .from("profiles")
            .upsert(
                {
                    id: user.id,
                    email,
                    username,
                    avatar_url:
                        (user.user_metadata?.avatar_url as string) ?? null,
                    vip_status: false,
                    role: "user",
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "id" }
            )
            .select(PROFILE_SELECT)
            .single();

        if (error) {
            console.warn("Profile upsert:", error.message);
            const retry = await fetchProfile(user.id);
            if (retry) return retry;
        } else if (data) {
            return data as UserProfile;
        }
    } catch (err) {
        console.warn("Profile upsert exception:", err);
    }

    return {
        id: user.id,
        email,
        username,
        vip_status: false,
        role: "user",
    };
}

function fallbackProfile(user: User): UserProfile {
    const email = user.email ?? "";
    return {
        id: user.id,
        email,
        username: deriveUsername(email, user.id),
        vip_status: false,
        role: "user",
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const resolveProfile = useCallback(async (authUser: User) => {
        try {
            const p = await ensureProfile(authUser);
            setProfile(p ?? fallbackProfile(authUser));
        } catch (err) {
            console.warn("resolveProfile:", err);
            setProfile(fallbackProfile(authUser));
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        if (!user) return;
        const p = await fetchProfile(user.id);
        if (p) setProfile(p);
    }, [user]);

    useEffect(() => {
        let mounted = true;
        let initialSessionHandled = false;

        const stopLoading = () => {
            if (mounted) setLoading(false);
        };

        const safetyTimer = window.setTimeout(stopLoading, LOADING_TIMEOUT_MS);

        supabase.auth
            .getSession()
            .then(({ data, error }) => {
                if (!mounted) return;

                if (error) {
                    console.warn("getSession:", error.message);
                }

                const currentSession = data.session ?? null;
                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    void resolveProfile(currentSession.user);
                } else {
                    setProfile(null);
                }

                initialSessionHandled = true;
                stopLoading();
            })
            .catch((err) => {
                console.warn("getSession exception:", err);
                if (mounted) {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                }
                stopLoading();
            });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (!mounted) return;

            // Avoid duplicate work: getSession() already handled initial state.
            if (event === "INITIAL_SESSION" && initialSessionHandled) {
                stopLoading();
                return;
            }

            setSession(newSession);
            setUser(newSession?.user ?? null);
            stopLoading();

            if (newSession?.user) {
                // Never await Supabase inside onAuthStateChange — causes deadlock.
                window.setTimeout(() => {
                    if (mounted) void resolveProfile(newSession.user!);
                }, 0);
            } else {
                setProfile(null);
            }
        });

        return () => {
            mounted = false;
            window.clearTimeout(safetyTimer);
            subscription.unsubscribe();
        };
    }, [resolveProfile]);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });
            if (error) return { error: error.message, profile: null };
            if (data.user) {
                const p = (await ensureProfile(data.user)) ?? fallbackProfile(data.user);
                setProfile(p);
                return { error: null, profile: p };
            }
            return { error: null, profile: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Sign in failed";
            return { error: message, profile: null };
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string) => {
        const trimmed = email.trim();
        const username = deriveUsername(trimmed);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: trimmed,
                password,
                options: { data: { username, full_name: username } },
            });

            if (error) {
                return { error: error.message, needsEmailConfirmation: false };
            }

            if (data.user) {
                window.setTimeout(() => {
                    void resolveProfile(data.user!);
                }, 300);
            }

            return { error: null, needsEmailConfirmation: !data.session };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Sign up failed";
            return { error: message, needsEmailConfirmation: false };
        }
    }, [resolveProfile]);

    const signOut = useCallback(async () => {
        try {
            await supabase.auth.signOut();
        } finally {
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
        }
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            session,
            profile,
            loading,
            isVip: Boolean(profile?.vip_status),
            isAdmin: profile?.role === "admin",
            signIn,
            signUp,
            signOut,
            refreshProfile,
        }),
        [
            user,
            session,
            profile,
            loading,
            signIn,
            signUp,
            signOut,
            refreshProfile,
        ]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
