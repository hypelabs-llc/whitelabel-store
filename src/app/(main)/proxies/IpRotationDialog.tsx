"use client";

import { type FormEvent, useState } from "react";
import { Button, Modal, TextInput } from "@/components/ui";
import { Timer } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import { updateProxyIpRotation } from "@/lib/actions/proxy";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

export default function IpRotationDialog({ proxyId, interval, isOpen, onClose }: { proxyId: string; interval?: number | null; isOpen: boolean; onClose: () => void }) {
	const { t } = useTranslation();
	const [enabled, setEnabled] = useState(interval != null);
	const [minutes, setMinutes] = useState(interval ?? 20);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		try {
			// UI works in minutes; the action converts to seconds. null disables rotation.
			await updateProxyIpRotation(proxyId, enabled ? minutes : null);
			toast.success(t("rotationDialog.success"));
			mutate("/api/proxies");
			onClose();
		} catch {
			toast.error(t("rotationDialog.fail"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal open={isOpen} onClose={onClose} title={t("rotationDialog.title")}>
			<form onSubmit={handleSubmit} className={"space-y-6"}>
				<p className={"text-sm text-muted"}>{t("rotationDialog.subtitle")}</p>

				<div className={"space-y-4"}>
					<button
						type={"button"}
						role={"switch"}
						aria-checked={enabled}
						onClick={() => setEnabled((value) => !value)}
						className={"flex w-full items-center gap-3 text-left"}
					>
						<span className={clsx("relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors", enabled ? "bg-brand" : "bg-line-strong")}>
							<span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform", enabled ? "translate-x-5" : "translate-x-1")} />
						</span>
						<span className={"text-sm font-medium text-fg-strong"}>{t("rotationDialog.enable")}</span>
					</button>
					{enabled && (
						<div className={"space-y-1.5"}>
							<label className={"text-sm font-medium text-fg-strong"}>{t("rotationDialog.interval")}</label>
							<TextInput type={"number"} value={minutes} min={1} max={1440} onValueChange={(value) => setMinutes(Number(value))} />
							<span className={"block text-xs text-muted"}>{t("rotationDialog.intervalHelp")}</span>
						</div>
					)}
				</div>

				<div className={"flex justify-end gap-3"}>
					<Button type={"button"} variant={"secondary"} onClick={onClose}>{t("rotationDialog.dismiss")}</Button>
					<Button type={"submit"} icon={Timer} loading={loading}>{t("rotationDialog.save")}</Button>
				</div>
			</form>
		</Modal>
	);
}
