"use client";

import { type SubmitEvent, useEffect, useState } from "react";
import { Button, Modal, TextInput } from "@/components/ui";
import { Dices, KeyRound, Target } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import { getClientIp, getProxyCredentials, updateProxyCredentials } from "@/lib/actions/proxy";
import { isIpv4 } from "@/lib";
import { useTranslation } from "react-i18next";

export default function ChangeCredentialsDialog({ proxyId, username, password, isOpen, onClose }: { proxyId: string; username: string; password: string; isOpen: boolean; onClose: () => void }) {
	const { t } = useTranslation();
	const [newUsername, setNewUsername] = useState(username);
	const [newPassword, setNewPassword] = useState(password);
	const [allowedIps, setAllowedIps] = useState("");
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);

	// Load the proxy's current credentials when the dialog opens, so the fields are pre-filled.
	useEffect(() => {
		if (!isOpen) return;
		let active = true;
		setFetching(true);
		getProxyCredentials(proxyId)
			.then((creds) => {
				if (!active || !creds) return;
				setNewUsername(creds.username ?? "");
				setNewPassword(creds.password ?? "");
				setAllowedIps((creds.allowedIps ?? []).join(", "));
			})
			.catch(() => {
				// Keep whatever the fields already hold if the fetch fails.
			})
			.finally(() => {
				if (active) setFetching(false);
			});
		return () => {
			active = false;
		};
	}, [isOpen, proxyId]);

	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Parse the comma-separated list, then validate each entry as a plain IPv4 address.
		const ips = allowedIps
			.split(",")
			.map((ip) => ip.trim())
			.filter(Boolean);
		const invalid = ips.find((ip) => !isIpv4(ip));
		if (invalid) {
			toast.error(t("credsDialog.invalidIp", { ip: invalid }));
			return;
		}

		setLoading(true);
		try {
			await updateProxyCredentials(proxyId, { username: newUsername, password: newPassword, allowedIps: ips });
			toast.success(t("credsDialog.success"));
			mutate("/api/proxies");
			onClose();
		} catch {
			toast.error(t("credsDialog.fail"));
		} finally {
			setLoading(false);
		}
	};

	// Append the caller's public IP to the allowed list (de-duplicated), read server-side from the request.
	const addMyIp = async () => {
		try {
			const ip = await getClientIp();
			if (!ip || !isIpv4(ip)) {
				toast.error(t("credsDialog.myIpFail"));
				return;
			}
			const current = allowedIps.split(",").map((value) => value.trim()).filter(Boolean);
			if (current.includes(ip)) return;
			setAllowedIps([...current, ip].join(", "));
		} catch {
			toast.error(t("credsDialog.myIpFail"));
		}
	};

	return (
		<Modal open={isOpen} onClose={onClose} title={t("credsDialog.title")}>
			<form onSubmit={handleSubmit} className={"space-y-6"}>
				<p className={"text-sm text-muted"}>{t("credsDialog.subtitle")}</p>

				<div className={"space-y-4"}>
					<div className={"space-y-1.5"}>
						<label className={"text-sm font-medium text-fg-strong required"}>{t("credsDialog.username")}</label>
						<TextInput value={newUsername} onValueChange={setNewUsername} required minLength={4} disabled={fetching} />
					</div>
					<div className={"space-y-1.5"}>
						<label className={"text-sm font-medium text-fg-strong required"}>{t("credsDialog.password")}</label>
						<div className={"flex items-center gap-2"}>
							<TextInput value={newPassword} onValueChange={setNewPassword} required minLength={6} className={"flex-1"} disabled={fetching} />
							<button type={"button"} onClick={() => setNewPassword(Math.random().toString(36).slice(2, 14))} className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:bg-surface-muted hover:text-fg"}>
								<Dices className={"h-4 w-4"} />
							</button>
						</div>
					</div>
					<div className={"space-y-1.5"}>
						<label className={"text-sm font-medium text-fg-strong"}>{t("credsDialog.allowedIps")}</label>
						<div className={"flex items-center gap-2"}>
							<TextInput value={allowedIps} onValueChange={setAllowedIps} placeholder={t("credsDialog.allowedIpsPlaceholder")} className={"flex-1"} disabled={fetching} />
							<button type={"button"} onClick={addMyIp} disabled={fetching} title={t("credsDialog.addMyIp")} aria-label={t("credsDialog.addMyIp")} className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:bg-surface-muted hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"}>
								<Target className={"h-4 w-4"} />
							</button>
						</div>
						<span className={"block text-xs text-muted"}>{t("credsDialog.allowedIpsHelp")}</span>
					</div>
				</div>

				<div className={"flex justify-end gap-3"}>
					<Button type={"button"} variant={"secondary"} onClick={onClose}>{t("credsDialog.dismiss")}</Button>
					<Button type={"submit"} icon={KeyRound} loading={loading} disabled={fetching}>{t("credsDialog.update")}</Button>
				</div>
			</form>
		</Modal>
	);
}
