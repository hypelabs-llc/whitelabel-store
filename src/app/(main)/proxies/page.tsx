import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/ui";
import ProxiesList from "./ProxiesList";

export const metadata: Metadata = {
	title: "Proxies",
	description: "Manage your proxies: credentials, IP rotation and more.",
};

export default function Page() {
	return (
		<Suspense fallback={<Loading />}>
			<ProxiesList />
		</Suspense>
	);
}
