import {
    BADGE_STYLES,
    getBadgeVariant,
} from "../utils/predictionBadge";

type PredictionBadgeProps = {
    type: string;
    vip?: boolean;
};

export default function PredictionBadge({ type, vip }: PredictionBadgeProps) {
    const variant = getBadgeVariant(type, vip);
    const styles = BADGE_STYLES[variant];

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm sm:text-xs ${styles}`}
        >
            {variant === "vip" && (
                <svg
                    className="h-3 w-3 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )}
            {type}
        </span>
    );
}
