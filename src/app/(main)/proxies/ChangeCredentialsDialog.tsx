"use client";

import { type FormEvent, useState } from "react";
import { Button, Modal, TextInput } from "@/components/ui";
import { Dices, KeyRound } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { mutate } from "swr";
import { useTranslation } from "react-i18next";

export default function ChangeCredentialsDialog({ proxyId, username, password, isOpen, onClose }: { proxyId: string; username: string; password: string; isOpen: boolean; onClose: () => void }) {
	const { t } = useTranslation();
	const [newUsername, setNewUsername] = useState(username);
	const [newPassword, setNewPassword] = useState(password);
	const [loading, setLoading] = useState(false);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		axios.post(`/api/services/change-credentials/${proxyId}`, { username: newUsername, password: newPassword })
			.then(() => { toast.success(t("credsDialog.success")); mutate("/api/proxies"); onClose(); })
			.catch(() => toast.error(t("credsDialog.fail")))
			.finally(() => setLoading(false));
	};

	return (
		<Modal open={isOpen} onClose={onClose} title={t("credsDialog.title")}>
			<form onSubmit={handleSubmit} className={"space-y-6"}>
				<p className={"text-sm text-muted"}>{t("credsDialog.subtitle")}</p>

				<div className={"space-y-4"}>
					<div className={"space-y-1.5"}>
						<label className={"text-sm font-medium text-fg-strong required"}>{t("credsDialog.username")}</label>
						<TextInput value={newUsername} onValueChange={setNewUsername} required minLength={4} />
					</div>
					<div className={"space-y-1.5"}>
						<label className={"text-sm font-medium text-fg-strong required"}>{t("credsDialog.password")}</label>
						<div className={"flex items-center gap-2"}>
							<TextInput value={newPassword} onValueChange={setNewPassword} required minLength={6} className={"flex-1"} />
							<button type={"button"} onClick={() => setNewPassword(Math.random().toString(36).slice(2, 14))} className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:bg-surface-muted hover:text-fg"}>
								<Dices className={"h-4 w-4"} />
							</button>
						</div>
					</div>
				</div>

				<div className={"flex justify-end gap-3"}>
					<Button type={"button"} variant={"secondary"} onClick={onClose}>{t("credsDialog.dismiss")}</Button>
					<Button type={"submit"} icon={KeyRound} loading={loading}>{t("credsDialog.update")}</Button>
				</div>
			</form>
		</Modal>
	);
}
