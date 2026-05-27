import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthCard, {
    AuthButton,
    AuthError,
    AuthInput,
} from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";
import { deriveUsername } from "../utils/profile";

export default function RegisterPage() {
    const { signUp, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!authLoading && user) {
        return <Navigate to="/" replace />;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const username = deriveUsername(email.trim());
        if (username.length < 2) {
            setError("Could not derive a valid username from email");
            return;
        }

        setSubmitting(true);
        const { error: signUpError, needsEmailConfirmation } = await signUp(
            email,
            password
        );
        setSubmitting(false);

        if (signUpError) {
            setError(signUpError);
            return;
        }

        if (needsEmailConfirmation) {
            setSuccess(
                "Account created! Check your email to confirm, then sign in."
            );
            return;
        }

        navigate("/", { replace: true });
    }

    return (
        <AuthCard
            title="Create account"
            subtitle="Join Football AI for match insights and VIP picks"
            footer={
                <>
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <AuthError message={error} />
                {success && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                        {success}
                    </div>
                )}
                <AuthInput
                    id="register-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    autoComplete="email"
                />
                <AdminHint email={email} />
                <AuthInput
                    id="register-password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                />
                <AuthInput
                    id="register-confirm"
                    label="Confirm password"
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                />
                <AuthButton loading={submitting}>Create account</AuthButton>
            </form>
        </AuthCard>
    );
}

function AdminHint({ email }: { email: string }) {
    if (!email.includes("@")) return null;
    const username = deriveUsername(email.trim());
    return (
        <p className="text-xs text-slate-500">
            Username will be:{" "}
            <span className="font-mono text-cyan-400/80">{username}</span>
        </p>
    );
}
