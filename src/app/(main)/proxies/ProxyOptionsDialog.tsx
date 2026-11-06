"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Button, EmptyState, Modal } from "@/components/ui";
import { Network, Save } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import { getProxyOptions, updateProxyOptions } from "@/lib/actions/proxy";
import type { ResolutionModes } from "@hypelabs-llc/ts-sdk";
import { useTranslation } from "react-i18next";

// Resolution modes the API accepts (ResolutionModesObject). The non-default mode needs the proxy's IPv6 capability.
const RESOLUTION_MODES: ResolutionModes[] = ["Default", "Ipv6"];

export default function ProxyOptionsDialog({
	proxyId,
	hasIpv6,
	isOpen,
	onClose,
}: {
	proxyId: string;
	hasIpv6: boolean;
	isOpen: boolean;
	onClose: () => void;
}) {
	const { t } = useTranslation();
	const [mode, setMode] = useState<ResolutionModes>("Default");
	const [loading, setLoading] = useState(false);

	// Pull the proxy's current options each time the dialog opens, so the select reflects the saved mode.
	useEffect(() => {
		if (!isOpen) return;
		let active = true;
		getProxyOptions(proxyId)
			.then((options) => {
				if (active && options?.resolutionMode) setMode(options.resolutionMode);
			})
			.catch(() => {
				// Reading options failed — leave the default selected; saving still works.
			});
		return () => {
			active = false;
		};
	}, [isOpen, proxyId]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		try {
			await updateProxyOptions(proxyId, { resolutionMode: mode });
			toast.success(t("optionsDialog.success"));
			mutate("/api/proxies");
			onClose();
		} catch {
			toast.error(t("optionsDialog.fail"));
		} finally {
			setLoading(false);
		}
	};

	const modeLabel = (value: ResolutionModes) => (value === "Ipv6" ? t("optionsDialog.modeIpv6") : t("optionsDialog.modeDefault"));

	// The resolution mode is the only option today, and it needs the IPv6 capability. With no modifiable
	// option, show an empty modal rather than a disabled form.
	const hasOptions = hasIpv6;

	return (
		<Modal open={isOpen} onClose={onClose} title={t("optionsDialog.title")}>
			{!hasOptions ? (
				<EmptyState bare icon={Network} title={t("optionsDialog.noOptionsTitle")} message={t("optionsDialog.noOptionsMessage")} className={"py-6"} />
			) : (
				<form onSubmit={handleSubmit} className={"space-y-6"}>
					{/* Single "IPv6" tab for now — the capabilities surface grows under it. */}
					<div className={"border-b border-line"}>
						<span className={"-mb-px inline-flex items-center gap-2 border-b-2 border-fg-strong px-1 pb-2 text-sm font-medium text-fg-strong"}>
							<Network className={"h-4 w-4"} />
							{t("optionsDialog.ipv6Tab")}
						</span>
					</div>

					<div className={"space-y-1.5"}>
						<label className={"text-sm font-medium text-fg-strong"}>{t("optionsDialog.resolutionMode")}</label>
						<select
							value={mode}
							onChange={(event) => setMode(event.target.value as ResolutionModes)}
							className={"w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"}
						>
							{RESOLUTION_MODES.map((value) => (
								<option key={value} value={value}>
									{modeLabel(value)}
								</option>
							))}
						</select>
						<span className={"block text-xs text-muted"}>{t("optionsDialog.resolutionHelp")}</span>
					</div>

					<div className={"flex justify-end gap-3"}>
						<Button type={"button"} variant={"secondary"} onClick={onClose}>
							{t("optionsDialog.dismiss")}
						</Button>
						<Button type={"submit"} icon={Save} loading={loading}>
							{t("optionsDialog.save")}
						</Button>
					</div>
				</form>
			)}
		</Modal>
	);
}
