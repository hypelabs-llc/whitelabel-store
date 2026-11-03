import { Loader2 } from "lucide-react";
import clsx from "clsx";

/** Centered loading spinner — shared Suspense/loading fallback across pages. */
export default function Loading({ className }: { className?: string }) {
	return (
		<section className={clsx("flex flex-1 items-center justify-center py-20", className)}>
			<Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
		</section>
	);
}
