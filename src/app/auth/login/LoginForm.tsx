"use client";
import { useState } from "react";
import { Button, TextInput } from "@/components/ui";
import { useConfiguration } from "@/contexts/configuration";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiGithub } from "react-icons/si";
import { useTranslation } from "react-i18next";

// Which OAuth providers are configured on this deployment (resolved server-side from env, no secrets).
export interface OAuthAvailability {
	github: boolean;
	google: boolean;
}

export default function LoginForm({ oauth }: { oauth: OAuthAvailability }) {
	const { t } = useTranslation();
	const configuration = useConfiguration();
	const router = useRouter();

	// Initialize to "" (not undefined) so the inputs are controlled from the first render.
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [loading, setLoading] = useState(false);

	// Hide a provider button when it isn't configured; hide the "or" divider when none are.
	const anyOAuth = oauth.github || oauth.google;

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		try {
			// Auth.js Credentials sign-in; authorize() validates against the Connect API server-side.
			const result = await signIn("credentials", { email, password, redirect: false });
			if (result?.error) {
				toast.error(t("auth.loginFailed"));
				return;
			}
			router.push("/");
			router.refresh();
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-5">
			<form onSubmit={handleSubmit} className="space-y-5">
				<div className="space-y-1.5">
					<label htmlFor="email" className="block text-sm font-medium text-fg">
						{t("auth.email")}
					</label>
					<TextInput id="email" name="email" type="email" value={email} onValueChange={setEmail} placeholder={t("auth.emailPlaceholder")} required />
				</div>

				<div className="space-y-1.5">
					<label htmlFor="password" className="block text-sm font-medium text-fg">
						{t("auth.password")}
					</label>
					<TextInput id="password" name="password" type="password" value={password} onValueChange={setPassword} placeholder={t("auth.passwordPlaceholder")} required />
				</div>

				<Button type="submit" icon={LogIn} size="lg" block disabled={loading} loading={loading}>
					{configuration?.storeName ? t("auth.signInAction", { storeName: configuration.storeName }) : t("auth.signInActionFallback")}
				</Button>
			</form>

			{anyOAuth && (
				<div className="flex items-center gap-3">
					<span className="h-px flex-1 bg-line" />
					<span className="text-xs uppercase tracking-wider text-muted">{t("auth.or")}</span>
					<span className="h-px flex-1 bg-line" />
				</div>
			)}

			{/* Social sign-in. Each provider goes through NextAuth's OAuth, then the identity is exchanged
			    for a Connect customer session server-side. A button only shows when its provider is configured. */}
			{anyOAuth && (
				<div className="space-y-3">
					{oauth.google && (
						<button
							type="button"
							onClick={() => signIn("google", { callbackUrl: "/" })}
							className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand/20"
						>
							<FcGoogle className="size-4" />
							{t("auth.continueWithGoogle")}
						</button>
					)}
					{oauth.github && (
						<button
							type="button"
							onClick={() => signIn("github", { callbackUrl: "/" })}
							className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand/20"
						>
							<SiGithub className="size-4" />
							{t("auth.continueWithGithub")}
						</button>
					)}
				</div>
			)}
		</div>
	);
}
