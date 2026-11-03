"use client";

import { Button } from "@/components/ui";
import { Activity } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function CheckProxyButton({ id, onDown }: { id: string; onDown?: () => void }) {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);

	const handleClick = () => {
		setLoading(true);
		axios
			.post(`/api/services/ping/${id}`)
			.then(() => toast.success(t("proxies.pingSuccess")))
			.catch(() => toast.error(t("proxies.pingFail"), onDown && {
				action: {
					label: t("proxies.reportIncident"),
					onClick: onDown,
				},
			}))
			.finally(() => setLoading(false));
	};

	return (
		<Button icon={Activity} variant={"secondary"} className={"flex-1"} onClick={handleClick} loading={loading}>
			{t("proxies.ping")}
		</Button>
	);
}
