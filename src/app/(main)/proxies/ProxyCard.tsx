"use client";

import { useState } from "react";
import { ClipboardList, Copy, Globe, Info, KeyRound, Loader2, Pencil, Sparkles, Timer } from "lucide-react";
import UpdateCommentDialog from "./UpdateCommentDialog";
import { Badge, Button, Card, Tooltip } from "@/components/ui";
import { CheckProxyButton } from "./CheckProxyButton";
import { CopyableId, ispIconUrl } from "@/lib";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "sonner";
import axios from "axios";
import { mutate } from "swr";
import { differenceInDays, differenceInHours } from "date-fns";
import { getIpRotationLink } from "@/lib/actions/proxy";
import RotateIpButton from "./RotateIpButton";
import ChangeCredentialsDialog from "./ChangeCredentialsDialog";
import IpRotationDialog from "./IpRotationDialog";
import { useTranslation } from "react-i18next";

import type { Proxy, Plain } from "@hypelabs-llc/ts-sdk";

function CopyRow({ label, value, info }: { label: string; value?: string | null; info?: string }) {
	const { t } = useTranslation();
	return (
		<div className={"flex items-center justify-between gap-3 py-2.5"}>
			<span className={"flex shrink-0 items-center gap-1.5 whitespace-nowrap text-fg-strong font-medium"}>
				{label}
				{info && (
					<Tooltip content={info}>
						<Info className={"h-3 w-3 shrink-0 text-muted"} />
					</Tooltip>
				)}
			</span>
			<CopyToClipboard text={value || ""} onCopy={() => toast.success(t("proxies.copied"))}>
				<button type={"button"} className={"group/copy flex min-w-0 items-center gap-1.5 text-fg transition-colors hover:text-brand"}>
					<span className={"truncate"}>{value ?? "-"}</span>
					<ClipboardList className={"h-4 w-4 shrink-0 text-muted transition-colors group-hover/copy:text-brand"} />
				</button>
			</CopyToClipboard>
		</div>
	);
}

export default function ProxyCard({ proxy, onReportIncident }: { proxy: Plain<Proxy>; onReportIncident?: (proxyId: string) => void }) {
	const { t } = useTranslation();
	const proxyId = proxy.id ?? "";
	const [commentOpen, setCommentOpen] = useState(false);
	const [credentialsOpen, setCredentialsOpen] = useState(false);
	const [rotationOpen, setRotationOpen] = useState(false);
	// The IP rotation link is generated on demand: the field starts empty and "Generate" fetches it.
	const [rotationLink, setRotationLink] = useState("");
	const [generatingLink, setGeneratingLink] = useState(false);
	const generateLink = async () => {
		setGeneratingLink(true);
		try {
			const result = await getIpRotationLink(proxyId);
			if (result?.link) setRotationLink(result.link);
			else toast.error(t("proxies.rotationLinkFail"));
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
	return (
		<Card className={"group space-y-5"}>
			<div className={"flex items-start justify-between gap-3"}>
				<div className={"flex items-center gap-4"}>
					<div className={"relative shrink-0"}>
						{countryCode ? (
							<img src={`/images/flags/${countryCode.toLowerCase()}.svg`} className={"w-10 rounded-full ring-4 ring-surface-muted"} alt={countryCode} />
						) : (
							<span className={"flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-muted ring-4 ring-surface-muted"}>
								<Globe className={"h-5 w-5"} />
							</span>
						)}
						{ispLogo && <img src={ispLogo} className={"absolute -bottom-1 -right-1 h-5 w-5 rounded-full ring-2 ring-surface"} alt={ispName ?? ""} />}
					</div>
					<div className={"min-w-0 space-y-0.5"}>
						<div className={"text-lg font-semibold text-fg-strong"}>{t("proxies.proxyLabel")} <CopyableId id={proxyId} /></div>
						<button type={"button"} className={"flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg"} onClick={() => setCommentOpen(true)}>
							<span className={"truncate"}>{proxy.note || t("proxies.noComment")}</span>
							<Pencil className={"h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"} />
						</button>
					</div>
				</div>
			</div>

			<div className={"divide-y divide-line border-y border-line text-sm"}>
				<CopyRow label={t("proxies.proxyHost")} value={proxy.host} />
				<CopyRow label={t("proxies.proxyIp")} value={proxy.ip} />
				<CopyRow label={t("proxies.port")} value={proxy.port?.toString()} info={t("proxies.portTooltip")} />
				{rotationMinutes != null && (
					<div className={"flex items-center justify-between gap-3 py-2.5"}>
						<span className={"shrink-0 whitespace-nowrap font-medium text-fg-strong"}>{t("proxies.autoRotation")}</span>
						<span className={"flex items-center gap-1.5 text-fg"}>
							<Timer className={"h-4 w-4 shrink-0 text-muted"} />
							{t("proxies.autoRotationEvery", { count: rotationMinutes })}
						</span>
					</div>
				)}
			</div>

			<div className={"space-y-1.5"}>
				<label className={"text-sm font-medium text-fg-strong"}>{t("proxies.ipRotationLink")}</label>
				<div className={"relative"}>
					{/* The field keeps the same box on every card. Until the link is generated, a "scratch-card"
					    overlay sits on top: a blurred teaser underneath, a reveal button on top. */}
					<div className={"flex items-center gap-1.5 overflow-hidden rounded-md border border-line bg-surface-muted px-3 pr-1.5"}>
						<Globe className={"h-4 w-4 shrink-0 text-muted"} />
						<input
							className={"min-w-0 flex-1 truncate border-0 bg-transparent py-2.5 font-mono text-sm text-fg ring-0 focus:border-0 focus:ring-0"}
							value={rotationLink || "https://••••••••••••••••••••••••••••"}
							readOnly
							aria-hidden={!rotationLink}
						/>
						<CopyToClipboard text={rotationLink} onCopy={() => toast.success(t("proxies.copied"))}>
							<button type={"button"} disabled={!rotationLink} className={"shrink-0 rounded p-1.5 text-muted transition-colors hover:text-brand disabled:opacity-40 disabled:hover:text-muted"}>
								<Copy className={"h-4 w-4"} />
							</button>
						</CopyToClipboard>
					</div>
					{!rotationLink && (
						<button
							type={"button"}
							onClick={generateLink}
							disabled={generatingLink}
							className={
								"group/scratch absolute inset-0 flex items-center justify-center gap-2 rounded-md text-sm font-medium text-fg-strong " +
								"bg-surface-muted/60 backdrop-blur-[3px] transition-colors hover:bg-surface-muted/40 disabled:cursor-wait"
							}
						>
							<span className={"pointer-events-none flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 shadow-sm transition-transform group-hover/scratch:scale-[1.02]"}>
								{generatingLink ? <Loader2 className={"h-4 w-4 animate-spin"} /> : <Sparkles className={"h-4 w-4 text-brand"} />}
								{t("proxies.generateRotationLink")}
							</span>
						</button>
					)}
				</div>
			</div>

			<div className={"flex flex-wrap gap-2"}>
				<CheckProxyButton id={proxyId} onDown={() => onReportIncident?.(proxyId)} />
				<RotateIpButton id={proxyId} />
				<Button onClick={() => setRotationOpen(true)} icon={Timer} variant={"secondary"} className={"flex-1"}>
					{t("proxies.autoRotation")}
				</Button>
				<Button onClick={() => setCredentialsOpen(true)} icon={KeyRound} variant={"secondary"} className={"flex-1"}>
					{t("proxies.credentials")}
				</Button>
			</div>

			<UpdateCommentDialog isOpen={commentOpen} initialComment={proxy.note ?? ""} onClose={() => setCommentOpen(false)} onSubmit={handleUpdateComment} />
			<ChangeCredentialsDialog proxyId={proxyId} username={""} password={""} isOpen={credentialsOpen} onClose={() => setCredentialsOpen(false)} />
			<IpRotationDialog proxyId={proxyId} interval={rotationMinutes} isOpen={rotationOpen} onClose={() => setRotationOpen(false)} />
		</Card>
	);
}
