import LoginForm from "./LoginForm";

// Read provider availability from runtime env, not the build: force dynamic so a provider configured on
// the deployment isn't hidden because its env var was absent when the page was prerendered.
export const dynamic = "force-dynamic";

// Server component: resolve which OAuth providers are configured from server-side env (no secrets reach
// the client, only booleans) and hand them to the client form so it can hide unavailable buttons.
export default function Login() {
	const oauth = {
		github: Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET),
		google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
	};
	return <LoginForm oauth={oauth} />;
}
