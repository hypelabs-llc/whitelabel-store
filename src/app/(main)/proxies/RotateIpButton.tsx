"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function RotateIpButton({ id, rotationKey }: { id: string; rotationKey: string }) {
	const { t } = useTranslation();
	const [loading, setLoading] = useState<boolean>(false);
	const handleClick = () => {
		setLoading(true);
		axios
			.post(`/api/services/rotate-ip/${id}?key=${encodeURIComponent(rotationKey)}`)
			.then(() => toast.success(t("proxies.rotateSuccess")))
			.catch(() => toast.error(t("proxies.rotateFail")))
			.finally(() => setLoading(false));
	};

	return (
		<Button onClick={handleClick} loading={loading} icon={RotateCw} variant={"secondary"} className={"flex-1"}>
			{t("proxies.rotateIp")}
		</Button>
	);
}
