"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export default function CrispChat({ websiteId }: { websiteId: string }) {
	useEffect(() => {
		if (websiteId) Crisp.configure(websiteId);
	}, [websiteId]);

	return null;
}
