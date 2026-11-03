"use client";
import { ArrowLeft, Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button, EmptyState } from "@/components/ui";

// The 404 boundary for the (main) group: rendered when notFound() is called inside it (including from
// the [...not-found] catch-all). It sits in the layout's <main> area, so it keeps the sidebar + top bar.
export default function NotFound() {
	const { t } = useTranslation();
	const router = useRouter();
	return (
		<div className="flex flex-1 items-center justify-center">
			<EmptyState icon={Compass} eyebrow={t("notFound.tagline")} title={t("notFound.title")} message={t("notFound.message")}>
				<Button size="lg" icon={ArrowLeft} onClick={() => router.push("/")}>
					{t("notFound.goBackHome")}
				</Button>
			</EmptyState>
		</div>
	);
}
