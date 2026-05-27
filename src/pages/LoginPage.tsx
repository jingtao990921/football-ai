import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthCard, {
    AuthButton,
    AuthError,
    AuthInput,
} from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { signIn, user, loading: authLoading, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from =
        (location.state as { from?: string } | null)?.from ?? "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!authLoading && user) {
        const target =
            from.startsWith("/admin") && isAdmin ? from : "/";
        return <Navigate to={target} replace />;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const { error: signInError, profile: loggedInProfile } = await signIn(
            email,
            password
        );
        setSubmitting(false);

        if (signInError) {
            setError(signInError);
            return;
        }

        const target =
            from.startsWith("/admin") && loggedInProfile?.role === "admin"
                ? from
                : "/";
        navigate(target, { replace: true });
    }

    return (
        <AuthCard
            title="Welcome back"
            subtitle="Sign in to access predictions and VIP features"
            footer={
                <>
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                        Register
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <AuthError message={error} />
                {from.startsWith("/admin") && (
                    <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                        Admin access requires an admin account. Sign in to
                        continue.
                    </p>
                )}
                <AuthInput
                    id="login-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    autoComplete="email"
                />
                <AuthInput
                    id="login-password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    autoComplete="current-password"
                />
                <AuthButton loading={submitting}>Sign in</AuthButton>
            </form>
        </AuthCard>
    );
}
