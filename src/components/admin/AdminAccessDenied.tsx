import { Link } from "react-router-dom";

export default function AdminAccessDenied() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#050508] px-4 text-center">
            <div className="max-w-md rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 shadow-[0_0_40px_rgba(244,63,94,0.1)]">
                <p className="text-4xl">🚫</p>
                <h1 className="mt-4 text-xl font-bold text-rose-300">
                    Access denied. Admin only.
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                    Your account does not have admin privileges. Contact an
                    administrator or sign in with an admin account.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        to="/"
                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950"
                    >
                        Back to Home
                    </Link>
                    <Link
                        to="/login"
                        className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
