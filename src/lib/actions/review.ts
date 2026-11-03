"use server";

// Server Action for creating a review (reads go through /api/reviews + SWR). Backed by the Connect SDK
// (server-side, API key never reaches the browser); the result is passed through toPlain() so it's a
// plain-data object across the server/client boundary.

import { getConnect } from "@/lib/connect";
import { auth } from "@/auth";
import { toPlain } from "@hypelabs-llc/ts-sdk";
import type { Review, CreateReviewRequest, Plain } from "@hypelabs-llc/ts-sdk";

// The caller supplies the review content; customerId is resolved server-side from the session.
export type NewReview = Pick<CreateReviewRequest, "content" | "rating" | "customAuthorName">;

/** Creates a review for the signed-in customer. */
export async function createReview(review: NewReview): Promise<Plain<Review> | null> {
	const session = await auth();
	const customerId = session?.user?.id;

	const created = await getConnect().reviews.post({
		content: review.content,
		rating: review.rating,
		customAuthorName: review.customAuthorName || undefined,
		customerId: customerId || undefined,
	} satisfies CreateReviewRequest);
	return created ? toPlain(created) : null;
}
