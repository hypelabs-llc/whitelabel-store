"use client";

import { Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui";
import { useState } from "react";
import { triggerIpRotation } from "@/lib/actions/proxy";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// `className` lets callers control width: the card passes "flex-1" (full width); the table row omits it.
// `iconOnly` renders a square icon button (list view) — same shape as the generate-link control beside it.
export default function RotateIpButton({
	id,
	className = "flex-1",
	size,
	iconOnly = false,
}: {
	id: string;
	className?: string;
	size?: "xs" | "sm" | "md" | "lg";
	iconOnly?: boolean;
}) {
	const { t } = useTranslation();
	const [loading, setLoading] = useState<boolean>(false);
	const handleClick = async () => {
		setLoading(true);
		try {
			await triggerIpRotation(id);
			toast.success(t("proxies.rotateSuccess"));
		} catch {
			toast.error(t("proxies.rotateFail"));
		} finally {
			setLoading(false);
		}
	};

	if (iconOnly) {
		return (
			<button
				type={"button"}
				onClick={handleClick}
				disabled={loading}
				title={t("proxies.rotateIp")}
				aria-label={t("proxies.rotateIp")}
				className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:bg-surface-muted hover:text-fg disabled:cursor-wait disabled:opacity-60"}
			>
				{loading ? <Loader2 className={"h-4 w-4 animate-spin"} /> : <RotateCw className={"h-4 w-4"} />}
			</button>
		);
	}

	return (
		<Button onClick={handleClick} loading={loading} icon={RotateCw} variant={"secondary"} size={size} className={className}>
			{t("proxies.rotateIp")}
		</Button>
	);
}
