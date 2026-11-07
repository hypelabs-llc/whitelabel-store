import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { getConnect } from "@/lib/connect";
import { maskImageUrl } from "@/lib/imageProxy";
import type { CustomerAuthResponse } from "@hypelabs-llc/ts-sdk";

// Exchanges an identity our front-end already verified with an external provider (e.g. GitHub) for a
// Connect customer session. Connect trusts the attested identity (it never calls the provider itself),
// links it to an existing customer with the same email or creates one, and returns the bearer token.
async function exchangeOAuthForCustomer(input: {
	provider: string;
	providerId: string;
	email?: string;
	displayName?: string;
}): Promise<CustomerAuthResponse | null> {
	try {
		const customer = await getConnect().customers.authenticate.oauth.post({
			provider: input.provider,
			providerId: input.providerId,
			email: input.email,
			displayName: input.displayName,
		});
		if (!customer?.userId || customer.isActive === false || !customer.accessToken) return null;
		return customer;
	} catch {
		return null;
	}
}

// Auth.js (NextAuth v5) configuration. Email/password goes through the Credentials provider; GitHub
// goes through its OAuth provider and is then exchanged for a Connect customer session in the jwt
// callback. Everything runs server-side, so the Connect API key never reaches the browser. Auth.js
// issues and manages the session cookie itself.
export const { handlers, signIn, signOut, auth } = NextAuth({
	trustHost: true,
	providers: [
		// Request user:email so we always get a usable email — Connect needs one to create a customer
		// on a first sign-in, and GitHub users may keep their primary email private.
		GitHub({ authorization: { params: { scope: "read:user user:email" } } }),
		Credentials({
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials) => {
				const email = typeof credentials?.email === "string" ? credentials.email.trim() : "";
				const password = typeof credentials?.password === "string" ? credentials.password : "";
				if (!email || !password) return null;

				let customer;
				try {
					customer = await getConnect().customers.authenticate.post({ email, password });
				} catch {
					// The SDK throws on non-2xx (e.g. 401 bad credentials) — treat as auth failure.
					return null;
				}

				// isActive is false for suspended accounts. Also require a token: without it we can't
				// make customer-scoped Connect calls.
				if (!customer?.userId || customer.isActive === false || !customer.accessToken) return null;

				// The returned object becomes the JWT/session user. Mask the avatar so the upstream host
				// never reaches the client (white-label). accessToken/expiresAt are read by the jwt
				// callback below and kept on the server-side token only — never sent to the browser.
				return {
					id: String(customer.userId),
					email: customer.email ?? undefined,
					name: customer.name ?? undefined,
					image: maskImageUrl(customer.avatar) ?? undefined,
					accessToken: customer.accessToken,
					accessTokenExpires: customer.expiresAt ? new Date(customer.expiresAt).getTime() : undefined,
				};
			},
		}),
	],
	pages: {
		signIn: "/auth/login",
	},
	session: { strategy: "jwt" },
	callbacks: {
		// Reject an OAuth sign-in that Connect won't accept (suspended account, or no email on a
		// first-time GitHub sign-in) instead of creating a session with no customer behind it.
		signIn: async ({ account, profile }) => {
			if (account?.provider !== "github") return true;
			const customer = await exchangeOAuthForCustomer({
				provider: "github",
				providerId: String(profile?.id ?? account.providerAccountId),
				email: typeof profile?.email === "string" ? profile.email : undefined,
				displayName: typeof profile?.name === "string" ? profile.name : undefined,
			});
			// Stash the resolved customer on the account so the jwt callback can read it without a
			// second round-trip (account is only present on this first-sign-in call).
			if (customer) (account as { customer?: CustomerAuthResponse }).customer = customer;
			return customer != null;
		},
		// Persist the customer id/email and the customer JWT on the token. The token is httpOnly and
		// server-side only; the accessToken is deliberately NOT copied onto the session (see below).
		jwt: ({ token, user, account }) => {
			// Credentials sign-in: authorize() already returned the customer fields on `user`.
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.accessToken = user.accessToken;
				token.accessTokenExpires = user.accessTokenExpires;
			}
			// OAuth sign-in: pick up the customer resolved by the signIn callback above.
			const customer = (account as { customer?: CustomerAuthResponse } | null)?.customer;
			if (customer) {
				token.id = String(customer.userId);
				token.email = customer.email ?? undefined;
				token.accessToken = customer.accessToken ?? undefined;
				token.accessTokenExpires = customer.expiresAt ? new Date(customer.expiresAt).getTime() : undefined;
			}
			return token;
		},
		session: ({ session, token }) => {
			if (token.id && session.user) session.user.id = token.id as string;
			if (token.email && session.user) session.user.email = token.email as string;
			return session;
		},
	},
});
