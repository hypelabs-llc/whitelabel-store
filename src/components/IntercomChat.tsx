"use client";

import { useEffect, useState } from "react";
import Intercom, { shutdown } from "@intercom/messenger-js-sdk";
import { useSession } from "@/lib/useSession";
import { useConfiguration } from "@/contexts/configuration";

// Per-tenant Intercom messenger, mirroring CrispChat: the appId comes from the tenant's store config, so
// each reseller wires their own workspace. Booted with the signed-in customer's identity. created_at is
// omitted — the customer sign-up date isn't in anything the session carries.
export default function IntercomChat({ appId }: { appId: string }) {
	const { user } = useSession();
	const configuration = useConfiguration();
	const userId = user?.userId;
	const name = user?.name ?? undefined;
	const email = user?.email ?? undefined;
	const avatarUrl = user?.avatarUrl ?? undefined;
	// Which reseller the conversation belongs to, so Intercom can segment by tenant.
	const tenant = configuration?.store?.name ?? undefined;

	useEffect(() => {
		if (!appId) return;
		Intercom({
			app_id: appId,
			...(userId ? { user_id: userId } : {}),
			...(name ? { name } : {}),
			...(email ? { email } : {}),
			...(avatarUrl ? { avatar: { type: "avatar", image_url: avatarUrl } } : {}),
			...(tenant ? { tenant } : {}),
		});
		// Tear the messenger down on unmount / appId change so it doesn't linger across sign-out.
		return () => shutdown();
	}, [appId, userId, name, email, avatarUrl, tenant]);

	return null;
}
