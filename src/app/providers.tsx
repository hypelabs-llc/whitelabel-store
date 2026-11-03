"use client";

// Client-side UI providers, ported from the Vite App.tsx — but WITHOUT the runtime data calls.
//
// The Connect SDK must be called server-side only (its API key can never reach the browser), so the
// data-fetching that App.tsx did from the client (axios/SWR against /api/*, the /health poller) is
// intentionally NOT wired here. This provider only sets up the client-side UI shell: i18n and the
// sonner toaster. Data will be fetched in Server Components / route handlers once the Connect SDK is
// wired in the next phase. axios stays configured (base URL + 401 redirect) for any remaining
// client calls we port later, but nothing here triggers a request on mount.

import axios from "axios";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { SWRConfig } from "swr";
import { HealthCheckConfig } from "@webscopeio/react-health-check";
import i18n from "@/i18n";

// Shared SWR fetcher: GET the key and return the JSON body. Used by every useSWR via SWRConfig below.
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// Base URL for any client-side API calls we keep; server-side Connect SDK calls don't use this.
if (process.env.NEXT_PUBLIC_API_URL) {
	axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
}

axios.interceptors.response.use(undefined, (error) => {
	if (error.response?.status === 401) {
		sessionStorage.clear();
		window.location.assign("/auth/login");
	}
	return Promise.reject(error);
});

export function Providers({ children }: { children: React.ReactNode }) {
	// Ensure i18n is initialized on the client before rendering translated content.
	useEffect(() => {
		void i18n;
	}, []);

	return (
		// No global refreshInterval and revalidation off: we don't want the SPA auto-polling the
		// old API. SWR stays available for components we port, but data comes from the server side.
		<SessionProvider>
			<SWRConfig value={{ fetcher, suspense: true, revalidateOnFocus: false, revalidateOnReconnect: false }}>
				<HealthCheckConfig
					value={{
						// TODO: point at our own /api/health proxy; for now hit Connect's /health directly.
						services: [{ name: "connect", url: "https://connect.hypelabs.network/health" }],
					}}
				>
					{children}
				</HealthCheckConfig>
				<Toaster position="bottom-right" expand />
			</SWRConfig>
		</SessionProvider>
	);
}
