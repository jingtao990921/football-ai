import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type AdminRouteProps = {
    children: ReactNode;
};

export default function AdminRoute({ children }: AdminRouteProps) {
    const { user, profile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#050508]">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    if (!profile || profile.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
