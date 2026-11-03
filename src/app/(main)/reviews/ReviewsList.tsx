"use client";

import { PlusCircle, Star } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import type { Review, Plain } from "@hypelabs-llc/ts-sdk";
import { Button, EmptyState, Heading } from "@/components/ui";
import CreateReviewDialog from "./CreateReviewDialog";
import ReviewCard from "./ReviewCard";
import { useTranslation } from "react-i18next";

// Suspense mode: the hook throws a promise while loading, so the <Suspense> in page.tsx shows the
// fallback and `reviews` is always defined here.
export default function ReviewsList() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const { data: reviews } = useSWR<Plain<Review>[]>("/api/reviews");

	const isEmpty = !reviews || reviews.length === 0;

	return (
		<>
			<CreateReviewDialog isOpen={open} onClose={() => setOpen(false)} />
			{isEmpty ? (
				<section className={"flex flex-1 flex-col"}>
					<EmptyState icon={Star} title={t("reviews.noReviews")} message={t("reviews.emptyHint")}>
						<Button icon={PlusCircle} size="lg" onClick={() => setOpen(true)}>
							{t("reviews.addReview")}
						</Button>
					</EmptyState>
				</section>
			) : (
				<section className={"space-y-6"}>
					<Heading
						icon={Star}
						title={t("reviews.title")}
						subtitle={t("reviews.subtitle")}
						actions={
							<Button icon={PlusCircle} onClick={() => setOpen(true)}>
								{t("reviews.addReview")}
							</Button>
						}
					/>
					<div className={"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"}>
						{reviews.map((review, index) => (
							<ReviewCard key={review.id ?? index} review={review} />
						))}
					</div>
				</section>
			)}
		</>
	);
}
