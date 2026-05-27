import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#050508]">
            <div
                className="pointer-events-none fixed inset-0 -z-10"
                aria-hidden
            >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.15),transparent)]" />
                <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
                <div className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-cyan-600/5 blur-[100px]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            <Navbar />
            <main>
                <Outlet />
            </main>

            <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-600">
                © {new Date().getFullYear()} Football AI — Powered by Supabase
            </footer>
        </div>
    );
}
