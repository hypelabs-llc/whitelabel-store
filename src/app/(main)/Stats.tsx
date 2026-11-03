"use client";
import { useMemo } from "react";
import useSWR from "swr";
import { Stat } from "@/components/ui";
import { Globe, LifeBuoy, Package, RefreshCw, Star } from "lucide-react";
import Link from "next/link";
import type { Review, Proxy, Product, Location, Plain } from "@hypelabs-llc/ts-sdk";
import { useConfiguration } from "@/contexts/configuration";
import { useTranslation } from "react-i18next";

// Real metrics row. Fetches its own data; the proxies tile links to /proxies, the ratings tile (when
// reviews are enabled) to /reviews.
export default function Stats() {
	const { t } = useTranslation();
	const configuration = useConfiguration();
	const showReviews = Boolean(configuration?.store?.showReviewsTab);

	const { data: proxies = [] } = useSWR<Plain<Proxy>[]>("/api/proxies");
	const { data: reviews = [] } = useSWR<Plain<Review>[]>("/api/reviews");
	// Locations come from the catalog, not the customer's proxies. They're listed per product, so we
	// take the first product and count its locations (a cascade: locations only load once we have a
	// productId).
	const { data: products = [] } = useSWR<Plain<Product>[]>("/api/catalog/products");
	const firstProductId = products[0]?.id ?? null;
	const { data: locations = [] } = useSWR<Plain<Location>[]>(
		firstProductId ? `/api/catalog/locations?productId=${firstProductId}` : null,
	);

	// Metrics derived from real Connect data only. The Proxy model carries no expiry/status, so we
	// surface what it does expose: how many proxies and how many auto-rotate.
	const proxyCount = proxies.length;
	const locationCount = locations.length;
	const rotatingCount = useMemo(
		() => proxies.filter((proxy) => proxy.features?.ipRotation).length,
		[proxies],
	);
	// Average rating across rated reviews, rounded to one decimal (null when there's nothing to average).
	const avgRating = useMemo(() => {
		const rated = reviews.map((review) => review.rating).filter((rating): rating is number => typeof rating === "number");
		if (rated.length === 0) return null;
		return Math.round((rated.reduce((sum, rating) => sum + rating, 0) / rated.length) * 10) / 10;
	}, [reviews]);

	return (
		<div className={"grid grid-cols-2 gap-4 lg:grid-cols-4"}>
			<Link href={"/proxies"} className={"group rounded-xl transition-opacity hover:opacity-90"}>
				<Stat
					icon={Package}
					label={t("home.activeProxies")}
					value={t("home.proxyCount", { count: proxyCount })}
					hint={t("home.activeProxiesHint")}
				/>
			</Link>
			<Stat
				icon={Globe}
				label={t("home.locations")}
				value={t("home.locationCount", { count: locationCount })}
				hint={t("home.locationsHint")}
			/>
			<Stat
				icon={RefreshCw}
				label={t("home.autoRotating")}
				value={t("home.rotatingCount", { count: rotatingCount })}
				hint={t("home.autoRotatingHint")}
			/>
			{showReviews ? (
				<Link href={"/reviews"} className={"group rounded-xl transition-opacity hover:opacity-90"}>
					<Stat
						icon={Star}
						label={t("home.rating")}
						value={avgRating === null ? "—" : avgRating.toFixed(1)}
						hint={t("home.reviewCount", { count: reviews.length })}
					/>
				</Link>
			) : (
				<Stat icon={LifeBuoy} label={t("home.support")} value={t("home.supportValue")} hint={t("home.supportHint")} />
			)}
		</div>
	);
}
