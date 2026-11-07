"use server";

// Server Action for creating a review (reads go through /api/reviews + SWR). Backed by the customer-scoped
// Connect SDK (server-side, the customer JWT never reaches the browser); the result is passed through
// toPlain() so it's a plain-data object across the server/client boundary. The customer is identified by
// the token, so customerId is no longer passed.

import { getCustomerConnect } from "@/lib/connect";
import { toPlain } from "@hypelabs-llc/ts-sdk";
import type { Review, CreateReviewRequest, Plain } from "@hypelabs-llc/ts-sdk";

// The caller supplies the review content; the customer is resolved from the session token.
export type NewReview = Pick<CreateReviewRequest, "content" | "rating" | "customAuthorName">;

/** Creates a review for the signed-in customer. */
export async function createReview(review: NewReview): Promise<Plain<Review> | null> {
	const client = await getCustomerConnect();
	if (!client) throw new Error("You must be signed in to leave a review.");

	const created = await client.reviews.post({
		content: review.content,
		rating: review.rating,
		customAuthorName: review.customAuthorName || undefined,
	} satisfies CreateReviewRequest);
	return created ? toPlain(created) : null;
}
