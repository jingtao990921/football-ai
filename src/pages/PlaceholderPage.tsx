import { Link } from "react-router-dom";

type PlaceholderPageProps = {
    title: string;
    description: string;
};

export default function PlaceholderPage({
    title,
    description,
}: PlaceholderPageProps) {
    return (
        <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:py-24">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="mt-4 text-slate-400">{description}</p>
            <Link
                to="/"
                className="mt-8 inline-block rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20"
            >
                ← Back to matches
            </Link>
        </section>
    );
}
