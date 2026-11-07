// Augment Auth.js types with the fields we persist on the token.
// The customer JWT lives ONLY on the server-side token (httpOnly), never on the client session.
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
	// What authorize() returns and what the jwt callback receives as `user`.
	interface User {
		accessToken?: string;
		accessTokenExpires?: number;
	}
}

declare module "next-auth/jwt" {
	interface JWT extends DefaultJWT {
		/** The customer's id (Connect userId). */
		id?: string;
		/** Connect customer JWT — server-side only, used to build a customer-scoped SDK client. */
		accessToken?: string;
		/** Epoch milliseconds at which accessToken expires. */
		accessTokenExpires?: number;
	}
}
