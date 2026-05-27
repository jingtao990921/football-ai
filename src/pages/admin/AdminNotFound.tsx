import { Link } from "react-router-dom";

export default function AdminNotFound() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 px-6 py-16 text-center">
            <p className="text-lg font-bold text-amber-300">Admin route not found</p>
            <p className="mt-2 text-sm text-slate-500">
                The admin URL you requested does not exist.
            </p>
            <Link
                to="/admin"
                className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20"
            >
                Go to Admin Dashboard
            </Link>
        </div>
    );
}
