"use client";
import { useState } from "react";
import { Button, TextInput } from "@/components/ui";
import { useConfiguration } from "@/contexts/configuration";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Login() {
	const { t } = useTranslation();
	const configuration = useConfiguration();
	const router = useRouter();

	// Initialize to "" (not undefined) so the inputs are controlled from the first render.
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [loading, setLoading] = useState(false);

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
	);
}
