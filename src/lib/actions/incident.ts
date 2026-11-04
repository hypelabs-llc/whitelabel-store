"use server";

// Server Action for reporting incidents. Runs on the server so the Connect SDK (and its API key) never
// reaches the browser; the reporter email is resolved from the signed-in session, never trusted from the client.

import { getConnect } from "@/lib/connect";
import { auth } from "@/auth";
import type { CreateIncidentRequest } from "@hypelabs-llc/ts-sdk";

// The caller provides the incident details; reporterEmail is set from the session, not the client.
export type NewIncident = Omit<CreateIncidentRequest, "reporterEmail">;

/** Opens an incident. Takes the SDK request as-is (minus reporterEmail, which comes from the session). */
export async function report(request: NewIncident): Promise<void> {
	if (!request.target) throw new Error("target is required");
	const session = await auth();
	await getConnect().incidents.post({ ...request, reporterEmail: session?.user?.email ?? undefined });
}
