"use client";

import { Button } from "@/components/ui";
import { Activity } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { pingProxy } from "@/lib/actions/proxy";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// Reflects the last ping result so the button border turns green (reachable) or red (down).
type PingStatus = "idle" | "up" | "down";

// `widthClass` lets callers control width: the card passes "flex-1" (full width); the table row omits it.
export function CheckProxyButton({ id, onDown, widthClass = "flex-1", size }: { id: string; onDown?: () => void; widthClass?: string; size?: "xs" | "sm" | "md" | "lg" }) {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState<PingStatus>("idle");

	// Offer "Report Incident" on a failure, whether the proxy answered unreachable or the call errored.
	const failToast = () =>
		toast.error(
			t("proxies.pingFail"),
			onDown ? { action: { label: t("proxies.reportIncident"), onClick: onDown } } : undefined,
		);

	const handleClick = async () => {
		setLoading(true);
		try {
			const result = await pingProxy(id);
			if (result?.reachable) {
				setStatus("up");
				const ms = result.latencyMilliseconds;
				toast.success(ms != null ? t("proxies.pingSuccessLatency", { ms }) : t("proxies.pingSuccess"));
			} else {
				setStatus("down");
				failToast();
			}
		} catch {
			setStatus("down");
			failToast();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			icon={Activity}
			variant={"secondary"}
			size={size}
			className={clsx(
				widthClass,
				"transition-colors",
				status === "up" && "!border-green-500 !text-green-600 dark:!text-green-400",
				status === "down" && "!border-red-500 !text-red-600 dark:!text-red-400",
			)}
			onClick={handleClick}
			loading={loading}
		>
			{status === "up" ? t("proxies.reachable") : status === "down" ? t("proxies.unreachable") : t("proxies.ping")}
		</Button>
	);
}
