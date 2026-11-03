"use client";
import { useState } from "react";
import { ArrowRight, Smile } from "lucide-react";
import { useConfiguration } from "@/contexts/configuration";
import { useTranslation } from "react-i18next";
import CreateReviewDialog from "./reviews/CreateReviewDialog";

// A small, friendly pill that opens the "write a review" dialog (not a link to /reviews).
export default function ReviewNudge() {
	const { t } = useTranslation();
	const configuration = useConfiguration();
	const storeName = configuration?.storeName;
	const [open, setOpen] = useState(false);

	// Hidden when the store doesn't expose reviews.
	if (!configuration?.store?.showReviewsTab) return null;

	return (
		<div className={"flex justify-center"}>
			<button
				type={"button"}
				onClick={() => setOpen(true)}
				className={
					"group inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-2 pr-3.5 text-xs font-medium text-fg transition-colors hover:border-brand hover:text-fg-strong"
				}
			>
				<span className={"flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"}>
					<Smile size={12} />
				</span>
				{/* Single line on mobile: truncate rather than wrap into the Crisp button. */}
				<span className={"truncate"}>{t("home.loveStore", { storeName })}</span>
				<ArrowRight size={12} className={"shrink-0 transition-transform group-hover:translate-x-0.5"} />
			</button>
			<CreateReviewDialog isOpen={open} onClose={() => setOpen(false)} />
		</div>
	);
}
