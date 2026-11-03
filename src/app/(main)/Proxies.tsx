"use client";
import useSWR from "swr";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { ArrowRight, Globe, LifeBuoy, Package, RefreshCw, ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { Proxy, Plain } from "@hypelabs-llc/ts-sdk";
import { useTranslation } from "react-i18next";

// The customer's proxies at a glance (real data), or the shared empty state when there are none.
export default function Proxies() {
	const { t } = useTranslation();
	const { data: proxies = [] } = useSWR<Plain<Proxy>[]>("/api/proxies");
	const hasProxies = proxies.length > 0;
	const recentProxies = proxies.slice(0, 4);

	return (
		<Card className={hasProxies ? "space-y-1" : "py-6"}>
			{hasProxies ? (
				<>
					<div className={"flex items-center justify-between gap-3 pb-1"}>
						<div className={"flex items-center gap-2.5"}>
							<span className={"flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand"}>
								<Package size={16} />
							</span>
							<h2 className={"text-base font-semibold tracking-tight text-fg-strong"}>{t("home.yourProxies")}</h2>
						</div>
						<Link
							href={"/proxies"}
							className={"group inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-fg"}
						>
							{t("home.viewAll")}
							<ArrowRight size={13} className={"transition-transform group-hover:translate-x-0.5"} />
						</Link>
					</div>

					<ul className={"divide-y divide-line"}>
						{recentProxies.map((proxy) => {
							const cc = proxy.location?.countryCode?.toLowerCase();
							const place = [proxy.location?.city, proxy.location?.countryCode].filter(Boolean).join(", ");
							return (
								<li key={proxy.id} className={"flex items-center gap-3 py-3"}>
									{cc ? (
										<img
											src={`/images/flags/${cc}.svg`}
											alt={proxy.location?.countryCode ?? ""}
											className={"h-6 w-6 shrink-0 rounded-full object-cover ring-2 ring-surface-muted"}
										/>
									) : (
										<span className={"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted"}>
											<Globe size={13} />
										</span>
									)}
									<div className={"min-w-0 flex-1"}>
										<div className={"truncate text-sm font-medium text-fg-strong"}>{proxy.host || t("home.proxyFallback")}</div>
										{place && <div className={"truncate text-xs text-muted"}>{place}</div>}
									</div>
									{proxy.isp?.name && (
										<span className={"hidden truncate text-xs text-muted sm:block"}>{proxy.isp.name}</span>
									)}
									{proxy.features?.ipRotation && (
										<Badge tone={"brand"} icon={RefreshCw}>
											{t("home.rotating")}
										</Badge>
									)}
								</li>
							);
						})}
					</ul>
				</>
			) : (
				<EmptyState bare className={"py-8"} icon={Package} message={t("home.noProxiesHint")}>
					<Link href={"/orders/create"} className={"w-full sm:w-auto"}>
						<Button icon={ShoppingCart} size={"lg"} block>
							{t("header.orderNow")}
						</Button>
					</Link>
					<Link href={"/support"} className={"w-full sm:w-auto"}>
						<Button icon={LifeBuoy} size={"lg"} variant={"secondary"} block>
							{t("home.supportCenter")}
						</Button>
					</Link>
				</EmptyState>
			)}
		</Card>
	);
}
