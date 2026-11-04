"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui";
import { useState } from "react";
import { triggerIpRotation } from "@/lib/actions/proxy";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// `className` lets callers control width: the card passes "flex-1" (full width); the table row omits it.
export default function RotateIpButton({ id, className = "flex-1", size }: { id: string; className?: string; size?: "xs" | "sm" | "md" | "lg" }) {
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

	return (
		<Button onClick={handleClick} loading={loading} icon={RotateCw} variant={"secondary"} size={size} className={className}>
			{t("proxies.rotateIp")}
		</Button>
	);
}
