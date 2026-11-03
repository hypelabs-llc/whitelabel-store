import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/ui";
import OrdersList from "./OrdersList";

export const metadata: Metadata = {
	title: "My Orders",
	description: "Track your proxy orders and their status.",
};

export default function Page() {
	return (
		<Suspense fallback={<Loading />}>
			<OrdersList />
		</Suspense>
	);
}
