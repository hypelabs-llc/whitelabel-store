import clsx from "clsx";
import { Quote, Star } from "lucide-react";
import type { Review, Plain } from "@hypelabs-llc/ts-sdk";
import { Card } from "@/components/ui";

export default function ReviewCard({ review }: { review: Plain<Review> }) {
	const rating = review.rating ?? 0;
	const author = review.customAuthorName ?? review.authorName ?? "";
	return (
		<Card className={"flex flex-col gap-5"}>
			<div className={"flex items-center justify-between"}>
				<div className={"flex items-center gap-1"}>
					{Array.from({ length: 5 }).map((_, idx) => (
						<Star
							key={idx}
							size={12}
							className={clsx(idx < rating ? "fill-brand text-brand" : "fill-line text-line")}
						/>
					))}
				</div>
				<Quote className={"h-8 w-8 text-brand/20"} aria-hidden={"true"} />
			</div>

			<blockquote className={"border-l-2 border-brand/30 pl-3"}>
				<p className={"italic leading-relaxed text-fg"}>&ldquo;{review.content}&rdquo;</p>
			</blockquote>

			<div className={"flex items-center gap-3 pt-2"}>
				<div className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-contrast"}>
					{author.charAt(0).toUpperCase()}
				</div>
				<p className={"font-semibold text-fg-strong"}>{author}</p>
			</div>
		</Card>
	);
}
