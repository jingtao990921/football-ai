import { Link } from "react-router-dom";

type VIPOverlayProps = {
    message?: string;
};

export default function VIPOverlay({
    message = "VIP Prediction Locked",
}: VIPOverlayProps) {
    return (
        <Link
            to="/vip"
            className="group/overlay absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl border border-amber-500/20 bg-slate-950/60 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/40 hover:bg-slate-950/50"
        >
            <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-40"
                style={{
                    background:
                        "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.15), transparent 70%)",
                }}
                aria-hidden
            />

            <span className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/50 bg-amber-500/15 shadow-[0_0_32px_rgba(251,191,36,0.25)] transition-transform duration-300 group-hover/overlay:scale-105">
                <svg
                    className="h-7 w-7 text-amber-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
            </span>

            <p className="relative px-4 text-center text-sm font-bold text-amber-100 sm:text-base">
                {message}
            </p>
            <p className="relative mt-1.5 text-xs text-slate-400 transition-colors group-hover/overlay:text-cyan-300">
                Tap to unlock VIP →
            </p>
        </Link>
    );
}
