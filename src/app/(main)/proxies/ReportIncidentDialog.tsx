"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Button, Modal, Textarea, TextInput } from "@/components/ui";
import { Send } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import useSWR from "swr";
import { shortId } from "@/lib";
import { useTranslation } from "react-i18next";

/** Minimal shape of the proxies the incident form lists (the SDK no longer ships this reseller-store type). */
type Proxy = { id: string; host?: string | null; port?: number | null };

// Quick-fill suggestions for the subject field (keys under reportDialog.suggestions.*).
const SUBJECT_SUGGESTIONS = ["down", "slow", "authFails"] as const;

export default function ReportIncidentDialog({ isOpen, proxyId, onClose }: { isOpen: boolean; proxyId?: string; onClose: () => void }) {
	const { t } = useTranslation();
	const { data: proxies } = useSWR<Proxy[]>("/api/proxies", { suspense: false });
	const [selectedProxyId, setSelectedProxyId] = useState<string>();
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen) setSelectedProxyId(proxyId);
	}, [isOpen, proxyId]);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selectedProxyId) return;
		setLoading(true);
		axios.post("/api/proxies/report-incident", { proxyId: selectedProxyId, subject, message })
			.then(() => { toast.success(t("reportDialog.success")); setSubject(""); setMessage(""); onClose(); })
			.catch(() => toast.error(t("reportDialog.fail")))
			.finally(() => setLoading(false));
	};

	return (
		<Modal open={isOpen} onClose={onClose} title={t("reportDialog.title")}>
			<form onSubmit={handleSubmit} className={"space-y-6"}>
				<p className={"text-sm text-muted"}>{t("reportDialog.subtitle")}</p>

				<div className={"space-y-4"}>
					<div className={"space-y-1.5"}>
						<label className={"text-sm font-medium text-fg-strong required"}>{t("reportDialog.proxy")}</label>
						<select
							value={selectedProxyId ?? ""}
							onChange={(event) => setSelectedProxyId(event.target.value || undefined)}
							required
							className={"w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"}
						>
							<option value={""} disabled>{t("reportDialog.selectProxy")}</option>
							{(proxies ?? []).map((proxy) => (
								<option key={proxy.id} value={proxy.id}>
									#{shortId(proxy.id)} — {proxy.host}:{proxy.port}
								</option>
							))}
						</select>
					</div>
					<div className={"space-y-1.5"}>
						<label className={"text-sm font-medium text-fg-strong required"}>{t("reportDialog.subject")}</label>
						<TextInput value={subject} onValueChange={setSubject} placeholder={t("reportDialog.subjectPlaceholder")} required />
						<div className={"flex flex-wrap gap-2 pt-1"}>
							{SUBJECT_SUGGESTIONS.map((key) => {
								const label = t(`reportDialog.suggestions.${key}`);
								const active = subject === label;
								return (
									<button
										key={key}
										type={"button"}
										onClick={() => setSubject(label)}
										aria-pressed={active}
										className={
											"rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
											(active ? "border-brand bg-brand-soft text-brand" : "border-line bg-surface text-muted hover:bg-surface-muted hover:text-fg")
										}
									>
										{label}
									</button>
								);
							})}
						</div>
					</div>
					<div className={"space-y-1.5"}>
						<label className={"text-sm font-medium text-fg-strong required"}>{t("reportDialog.message")}</label>
						<Textarea value={message} onValueChange={setMessage} placeholder={t("reportDialog.messagePlaceholder")} rows={4} required />
					</div>
				</div>

				<div className={"flex justify-end gap-3"}>
					<Button type={"button"} variant={"secondary"} onClick={onClose}>{t("reportDialog.dismiss")}</Button>
					<Button type={"submit"} icon={Send} disabled={!selectedProxyId} loading={loading}>{t("reportDialog.send")}</Button>
				</div>
			</form>
		</Modal>
	);
}
