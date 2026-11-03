"use client";
import { ArrowLeft, Compass } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function NotFound() {
	const { t } = useTranslation();
	const router = useRouter();
	return (
		<div className="flex min-h-screen flex-col items-center justify-center px-6">
			<EmptyState icon={Compass} eyebrow={t("notFound.tagline")} title={t("notFound.title")} message={t("notFound.message")}>
				<Button size="lg" icon={ArrowLeft} onClick={() => router.push("/")}>
					{t("notFound.goBackHome")}
				</Button>
			</EmptyState>
		</div>
	);
}
