import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/ui";
import ReviewsList from "./ReviewsList";

export const metadata: Metadata = {
	title: "Reviews",
	description: "Read what our customers say and share your own experience.",
};

export default function Page() {
	return (
		<Suspense fallback={<Loading />}>
			<ReviewsList />
		</Suspense>
	);
}
