"use client";

import { LifeBuoy } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import { useConfiguration } from "@/contexts/configuration";
import { useTranslation } from "react-i18next";

export default function SupportView() {
	const { t } = useTranslation();
	const configuration = useConfiguration();
	const supportUrl = configuration?.store?.supportUrl;
	return (
		<EmptyState icon={LifeBuoy} eyebrow={t("support.heading")} title={t("support.title")} message={t("support.subtitle")}>
			{supportUrl ? (
				<a href={supportUrl} rel={"noreferrer"} target={"_blank"}>
					<Button size={"lg"} icon={LifeBuoy}>
						{t("support.contactSupport")}
					</Button>
				</a>
			) : null}
		</EmptyState>
	);
}
