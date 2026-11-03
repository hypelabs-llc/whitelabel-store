"use client";

// Adapter over Auth.js (NextAuth v5). The app was built against a custom SessionContext; rather than
// rewrite every consumer, this exposes the same small API (user / isAuthenticated / signIn / signOut)
// but backed by NextAuth's session. The real credential is NextAuth's httpOnly session cookie.
//
// `user` keeps the shape the components already read: { userId, name, avatarUrl, isAdmin }.

import { signIn as nextSignIn, signOut as nextSignOut, useSession as useNextAuthSession } from "next-auth/react";

export interface SessionUser {
	userId: string;
	name?: string | null;
	avatarUrl?: string | null;
	/** Store admin flag. Connect customers are not store admins; kept for API compatibility. */
	isAdmin: boolean;
}

export function useSession() {
	const { data, status } = useNextAuthSession();

	const user: SessionUser | null = data?.user
		? {
				userId: (data.user as { id?: string }).id ?? "",
				name: data.user.name,
				avatarUrl: data.user.image,
				isAdmin: false,
			}
		: null;

	return {
		user,
		/** "loading" | "authenticated" | "unauthenticated" — lets callers avoid acting during load. */
		status,
		isAuthenticated: () => status === "authenticated",
		signIn: (email: string, password: string) => nextSignIn("credentials", { email, password, redirect: false }),
		signOut: () => nextSignOut({ redirectTo: "/auth/login" }),
	};
}
