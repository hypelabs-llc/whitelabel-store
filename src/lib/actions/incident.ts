"use server";

// Server Action for reporting incidents. Runs on the server so the customer JWT never reaches the
// browser. The reporter is identified by the session token, so reporterEmail is no longer passed.

import { getCustomerConnect } from "@/lib/connect";
import type { CreateIncidentRequest } from "@hypelabs-llc/ts-sdk";

// The caller provides the incident details; the reporter comes from the session token.
export type NewIncident = Omit<CreateIncidentRequest, "reporterEmail">;

/** Opens an incident for the signed-in customer. */
export async function report(request: NewIncident): Promise<void> {
	if (!request.target) throw new Error("target is required");
	const client = await getCustomerConnect();
	if (!client) throw new Error("You must be signed in to report an incident.");
	await client.incidents.post(request);
}
