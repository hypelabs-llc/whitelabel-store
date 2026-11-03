"use client";

import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { Heading } from "@/components/ui";
import { markdownComponents } from "@/lib/markdown";
import { useConfiguration } from "@/contexts/configuration";

export default function DocumentationView() {
	const { t } = useTranslation();
	const configuration = useConfiguration();
	const markdown = configuration?.store?.documentationMd ?? "";

	return (
		<>
			<Heading icon={BookOpen} title={t("documentation.title")} subtitle={t("documentation.subtitle")} />
			{markdown ? (
				<article className="max-w-none">
					<ReactMarkdown components={markdownComponents}>{markdown}</ReactMarkdown>
				</article>
			) : (
				<p className="py-8 text-center text-sm text-muted">{t("documentation.empty")}</p>
			)}
		</>
	);
}
