import type { Proxy, Plain } from "@hypelabs-llc/ts-sdk";

// Builds a CSV of the given proxies and triggers a browser download. Client-only (uses Blob + <a>).
export function exportProxiesCsv(proxies: Plain<Proxy>[], filename = "proxies.csv"): void {
	const csv =
		"host,ip,port,country,city,isp\n" +
		proxies
			.map((proxy) =>
				[proxy.host, proxy.ip, proxy.port, proxy.location?.countryCode, proxy.location?.city, proxy.isp?.name]
					.map((field) => field ?? "")
					.join(","),
			)
			.join("\n");

	const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}
