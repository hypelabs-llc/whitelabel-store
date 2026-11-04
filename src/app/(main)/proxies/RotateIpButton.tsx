"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui";
import { useState } from "react";
import { triggerIpRotation } from "@/lib/actions/proxy";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function RotateIpButton({ id }: { id: string }) {
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
		<Button onClick={handleClick} loading={loading} icon={RotateCw} variant={"secondary"} className={"flex-1"}>
			{t("proxies.rotateIp")}
		</Button>
	);
}
