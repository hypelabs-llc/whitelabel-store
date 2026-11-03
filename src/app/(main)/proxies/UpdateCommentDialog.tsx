"use client";

import { useState } from "react";
import { Button, Modal, TextInput } from "@/components/ui";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function UpdateCommentDialog({ isOpen, initialComment, onClose, onSubmit }: { isOpen: boolean; initialComment: string; onClose: () => void; onSubmit: (comment: string) => void }) {
	const { t } = useTranslation();
	const [comment, setComment] = useState(initialComment);

	return (
		<Modal open={isOpen} onClose={onClose} title={t("commentDialog.title")}>
			<form className={"space-y-6"} onSubmit={(event) => { event.preventDefault(); onSubmit(comment); }}>
				<div className={"space-y-2"}>
					<p className={"text-sm text-muted"}>{t("commentDialog.subtitle")}</p>
					<TextInput value={comment} onValueChange={setComment} placeholder={t("commentDialog.placeholder")} />
				</div>

				<div className={"flex justify-end gap-3"}>
					<Button type={"button"} variant={"secondary"} onClick={onClose}>{t("commentDialog.dismiss")}</Button>
					<Button type={"submit"} icon={Save}>{t("commentDialog.save")}</Button>
				</div>
			</form>
		</Modal>
	);
}
