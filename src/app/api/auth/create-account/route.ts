import { NextResponse } from "next/server";
import { getCustomerConnect } from "@/lib/connect";

// Server-side account creation. The register form posts { name, email, password, confirmPassword,
// acceptTerms } here; this handler validates, then creates the customer through the anonymous customer
// client (scoped to the org via X-Organization-Id, no secret key). On success the client signs in via
// NextAuth credentials.

// Error body shaped like what the register form reads: { message, errors: [{ description }] }.
function errorResponse(message: string, description: string, status: number) {
	return NextResponse.json({ message, errors: [{ description }] }, { status });
}

export async function POST(request: Request) {
	let body: { name?: string; email?: string; password?: string; confirmPassword?: string; acceptTerms?: boolean };
	try {
		body = await request.json();
	} catch {
		return errorResponse("Invalid request.", "The request body must be valid JSON.", 400);
	}

	const name = body.name?.trim();
	const email = body.email?.trim();
	const password = body.password;

	if (!name || !email || !password) {
		return errorResponse("Missing fields.", "Name, email and password are required.", 400);
	}
	if (password !== body.confirmPassword) {
		return errorResponse("Passwords don't match.", "The password and its confirmation must match.", 400);
	}
	if (!body.acceptTerms) {
		return errorResponse("Terms not accepted.", "You must accept the terms to create an account.", 400);
	}

	let customer;
	try {
		const connect = (await getCustomerConnect({ anonymous: true }))!;
		customer = await connect.customers.post({ email, password, displayName: name });
	} catch {
		// The SDK throws on non-2xx (e.g. 409 email already used, 422 validation).
		return errorResponse("Registration failed.", "Could not create the account. The email may already be in use.", 400);
	}

	if (!customer?.id) {
		return errorResponse("Registration failed.", "Could not create the account.", 400);
	}

	// The client will sign in with NextAuth right after. Return the minimal customer info.
	return NextResponse.json({
		userId: String(customer.id),
		email: customer.email ?? undefined,
		name: customer.displayName ?? undefined,
	});
}
