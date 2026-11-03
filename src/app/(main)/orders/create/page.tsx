import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/ui";
import { OrderBuilder } from "./OrderBuilder";

export const metadata: Metadata = {
	title: "New Order",
	description: "Pick a location, carrier and plan, then place your proxy order.",
};

export default function Page() {
	return (
		<Suspense fallback={<Loading />}>
			<OrderBuilder />
		</Suspense>
	);
}
