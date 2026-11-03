"use client";

import { useConfiguration } from "@/contexts/configuration";

export default function Banner() {
	const configuration = useConfiguration();
	return (
		<nav className={"px-8 py-2.5 truncate text-center text-xs bg-brand text-brand-contrast"}>
			{configuration?.store?.topBannerMessage}
		</nav>
	);
}
