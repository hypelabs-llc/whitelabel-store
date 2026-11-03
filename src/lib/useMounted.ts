"use client";

import { useEffect, useState } from "react";

// Returns false during SSR and the first client render, then true after mount. Use it to gate any
// UI that depends on client-only state (e.g. next-themes' `theme`/`resolvedTheme`), so the server
// HTML matches the first client render and React doesn't throw a hydration mismatch.
export function useMounted() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	return mounted;
}
