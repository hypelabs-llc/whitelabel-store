"use client";

import { useState } from "react";
import { Globe, KeyRound, Link2, Loader2, Pencil, Timer } from "lucide-react";
import UpdateCommentDialog from "./UpdateCommentDialog";
import { Button } from "@/components/ui";
import { CheckProxyButton } from "./CheckProxyButton";
import { CopyableId, CopyButton, ispIconUrl } from "@/lib";
import { toast } from "sonner";
import axios from "axios";
import { mutate } from "swr";
import { getIpRotationLink } from "@/lib/actions/proxy";
import RotateIpButton from "./RotateIpButton";
import ChangeCredentialsDialog from "./ChangeCredentialsDialog";
import IpRotationDialog from "./IpRotationDialog";
import { useTranslation } from "react-i18next";

import type { Proxy, Plain } from "@hypelabs-llc/ts-sdk";

export default function ProxyRow({ proxy, onReportIncident }: { proxy: Plain<Proxy>; onReportIncident?: (proxyId: string) => void }) {
	const { t } = useTranslation();
	const proxyId = proxy.id ?? "";
	const [commentOpen, setCommentOpen] = useState(false);
	const [credentialsOpen, setCredentialsOpen] = useState(false);
	const [rotationOpen, setRotationOpen] = useState(false);
	const [rotationLink, setRotationLink] = useState("");
	const [generatingLink, setGeneratingLink] = useState(false);

	// In the row we don't show the link in plain text: generating it copies it straight to the clipboard.
	const copyLink = async () => {
		setGeneratingLink(true);
		try {
			const link = rotationLink || (await getIpRotationLink(proxyId))?.link;
			if (!link) {
				toast.error(t("proxies.rotationLinkFail"));
				return;
			}
			setRotationLink(link);
			await navigator.clipboard.writeText(link);
			toast.success(t("proxies.copied"));
		} catch {
			toast.error(t("proxies.rotationLinkFail"));
		} finally {
			setGeneratingLink(false);
		}
	};

	const handleUpdateComment = (comment: string) => {
		axios
			.post(`/api/proxies/${proxyId}/comment`, { comment })
			.then(() => toast.success(t("proxies.commentSaved")))
			.then(() => mutate("/api/proxies"))
			.catch(() => toast.error(t("proxies.commentFail")))
			.finally(() => setCommentOpen(false));
	};

	const countryCode = proxy.location?.countryCode;
	const ispName = proxy.isp?.name;
	const ispLogo = proxy.isp?.logoUrl ?? (proxy.isp?.id ? ispIconUrl(proxy.isp.id) : undefined);
	const rotationMinutes = proxy.features?.ipRotation?.intervalMinutes;
	const endpoint = proxy.host && proxy.port ? `${proxy.host}:${proxy.port}` : proxy.host;

	return (
		<tr className={"group align-middle transition-colors hover:bg-surface-muted/40"}>
			{/* Proxy: flag + isp badge, id, editable comment */}
			<td className={"px-4 py-3"}>
				<div className={"flex min-w-0 items-center gap-3"}>
					<div className={"relative shrink-0"}>
						{countryCode ? (
							<img src={`/images/flags/${countryCode.toLowerCase()}.svg`} className={"h-8 w-8 rounded-full ring-2 ring-surface-muted"} alt={countryCode} />
						) : (
							<span className={"flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-muted ring-2 ring-surface-muted"}>
								<Globe className={"h-4 w-4"} />
							</span>
						)}
						{ispLogo && <img src={ispLogo} className={"absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ring-surface"} alt={ispName ?? ""} />}
					</div>
					<div className={"min-w-0"}>
						<div className={"flex items-center gap-1.5 font-medium text-fg-strong"}>
							{t("proxies.proxyLabel")} <CopyableId id={proxyId} />
						</div>
						<button type={"button"} className={"flex max-w-full items-center gap-1 text-xs text-muted transition-colors hover:text-fg"} onClick={() => setCommentOpen(true)}>
							<span className={"truncate"}>{proxy.note || t("proxies.noComment")}</span>
							<Pencil className={"h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"} />
						</button>
					</div>
				</div>
			</td>

			{/* Ping */}
			<td className={"px-4 py-3"}>
				<CheckProxyButton id={proxyId} onDown={() => onReportIncident?.(proxyId)} widthClass={""} size={"sm"} />
			</td>

			{/* Endpoint: host:port + ip, each with the shared copy button */}
			<td className={"px-4 py-3"}>
				<div className={"min-w-0 space-y-0.5"}>
					{[endpoint, proxy.ip].map((value, index) =>
						value ? (
							<span key={index} className={"flex min-w-0 items-center gap-1.5 text-fg"}>
								<span className={"truncate font-mono"}>{value}</span>
								<CopyButton value={value} />
							</span>
						) : (
							<span key={index} className={"block text-muted"}>
								-
							</span>
						),
					)}
				</div>
			</td>

			{/* Authentication */}
			<td className={"px-4 py-3"}>
				<Button onClick={() => setCredentialsOpen(true)} icon={KeyRound} variant={"secondary"} size={"sm"} className={"shrink-0 whitespace-nowrap"}>
					{t("proxies.credentials")}
				</Button>
			</td>

			{/* IP Rotation: auto-rotation config, rotate now, generate link */}
			<td className={"px-4 py-3"}>
				<div className={"flex min-w-0 items-center gap-2"}>
					<Button onClick={() => setRotationOpen(true)} icon={Timer} variant={"secondary"} size={"sm"}>
						{rotationMinutes != null ? t("proxies.autoRotationEvery", { count: rotationMinutes }) : t("proxies.autoRotation")}
					</Button>
					<RotateIpButton id={proxyId} className={""} size={"sm"} />
					<button
						type={"button"}
						onClick={copyLink}
						disabled={generatingLink}
						title={t("proxies.copyRotationLink")}
						aria-label={t("proxies.copyRotationLink")}
						className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:bg-surface-muted hover:text-fg disabled:cursor-wait disabled:opacity-60"}
					>
						{generatingLink ? <Loader2 className={"h-4 w-4 animate-spin"} /> : <Link2 className={"h-4 w-4"} />}
					</button>
				</div>

				{/* Dialogs render through a portal, so they're valid inside a cell. */}
				<UpdateCommentDialog isOpen={commentOpen} initialComment={proxy.note ?? ""} onClose={() => setCommentOpen(false)} onSubmit={handleUpdateComment} />
				<ChangeCredentialsDialog proxyId={proxyId} username={""} password={""} isOpen={credentialsOpen} onClose={() => setCredentialsOpen(false)} />
				<IpRotationDialog proxyId={proxyId} interval={rotationMinutes} isOpen={rotationOpen} onClose={() => setRotationOpen(false)} />
			</td>
		</tr>
	);
}
