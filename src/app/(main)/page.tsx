import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/ui";
import Hero from "./Hero";
import Stats from "./Stats";
import Proxies from "./Proxies";
import ReviewNudge from "./ReviewNudge";

export const metadata: Metadata = {
	title: "Home",
	description: "Your proxies, reviews and account at a glance.",
};

export default function Page() {
	return (
		<Suspense fallback={<Loading />}>
			<section className={"space-y-6"}>
				<Hero />
				<Stats />
				<Proxies />
				<ReviewNudge />
			</section>
		</Suspense>
	);
}
