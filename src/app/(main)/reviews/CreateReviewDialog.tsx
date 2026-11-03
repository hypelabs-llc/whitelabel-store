"use client";
import { type SubmitEvent, useState, useTransition } from "react";
import { mutate } from "swr";
import { toast } from "sonner";
import clsx from "clsx";
import { Star } from "lucide-react";
import { Button, Modal, TextInput, Textarea } from "@/components/ui";
import { useSession } from "@/lib/useSession";
import { useTranslation } from "react-i18next";
import { createReview } from "@/lib/actions/review";

export default function CreateReviewDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
	const { t } = useTranslation();
	const { user } = useSession();
	// Default to "" (not undefined) so the inputs stay controlled from the first render.
	const [author, setAuthor] = useState<string>(user?.name ?? "");
	const [content, setContent] = useState<string>("");
	const [rating, setRating] = useState(5);
	const [submitting, startSubmitting] = useTransition();

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		startSubmitting(async () => {
			try {
				await createReview({ customAuthorName: author, content, rating });
				toast.success(t("reviewDialog.success"));
				onClose();
				await mutate("/api/reviews");
			} catch {
				toast.error(t("reviewDialog.fail"));
			}
		});
	};

	return (
		<Modal
			open={isOpen}
			onClose={onClose}
			title={
				<span className={"inline-flex items-center gap-2"}>
					<Star className={"h-4 w-4 text-brand"} aria-hidden={"true"} />
					{t("reviewDialog.title")}
				</span>
			}
		>
			<p className={"text-sm text-muted"}>{t("reviewDialog.subtitle")}</p>

			<form onSubmit={handleSubmit} className={"mt-6 space-y-6"}>
				<div className={"space-y-1.5"}>
					<label className={"text-sm font-medium text-fg-strong required"}>{t("reviewDialog.author")}</label>
					<TextInput value={author} onValueChange={setAuthor} placeholder={t("reviewDialog.authorPlaceholder")} required />
				</div>

				<div className={"space-y-1.5"}>
					<label className={"text-sm font-medium text-fg-strong required"}>{t("reviewDialog.content")}</label>
					<Textarea value={content} onValueChange={setContent} placeholder={t("reviewDialog.contentPlaceholder")} rows={7} required />
				</div>

				<div className={"space-y-1.5"}>
					<label className={"text-sm font-medium text-fg-strong"}>{t("reviewDialog.rating")}</label>
					<div className={"flex items-center gap-1"}>
						{[1, 2, 3, 4, 5].map((value) => (
							<button
								key={value}
								type={"button"}
								onClick={() => setRating(value)}
								className={"rounded-md p-1 transition-colors hover:bg-surface-muted"}
								aria-label={`${value}`}
							>
								<Star
									className={clsx("h-5 w-5", value <= rating ? "fill-brand text-brand" : "text-line")}
								/>
							</button>
						))}
					</div>
				</div>

				<div className={"flex items-center justify-end gap-3"}>
					<Button type={"button"} variant={"secondary"} onClick={onClose}>
						{t("reviewDialog.dismiss")}
					</Button>
					<Button type={"submit"} loading={submitting} disabled={submitting}>
						{t("reviewDialog.submit")}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
