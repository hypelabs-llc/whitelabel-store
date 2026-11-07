import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getConnect } from "@/lib/connect";
import { maskImageUrl } from "@/lib/imageProxy";

// Auth.js (NextAuth v5) configuration. A single Credentials provider authenticates email/password
// against the HypeLabs Connect API. authorize() runs server-side, so the Connect API key (used by
// `getConnect`) never reaches the browser. Auth.js issues and manages the session cookie itself.
export const { handlers, signIn, signOut, auth } = NextAuth({
	trustHost: true,
	providers: [
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
		// Persist the customer id/email and the customer JWT on the token. The token is httpOnly and
		// server-side only; the accessToken is deliberately NOT copied onto the session (see below).
		jwt: ({ token, user }) => {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.accessToken = user.accessToken;
				token.accessTokenExpires = user.accessTokenExpires;
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
