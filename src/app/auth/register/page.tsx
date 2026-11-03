"use client";
import axios, { type AxiosError } from "axios";
import { type FormEvent, useState } from "react";
import { Button, TextInput } from "@/components/ui";
import { useConfiguration } from "@/contexts/configuration";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useSession } from "@/lib/useSession";
import { useTranslation } from "react-i18next";

export default function Register() {
	const { t } = useTranslation();
	const configuration = useConfiguration();
	const router = useRouter();
	const { signIn } = useSession();

	// Initialize to "" (not undefined) so the inputs are controlled from the first render.
	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		try {
			// Create the account server-side (route handler wraps the Connect SDK), then sign in.
			await axios.post("/api/auth/create-account", { name, email, password, confirmPassword, acceptTerms });
			const result = await signIn(email, password);
			if (result?.error) {
				toast.error(t("auth.registrationFailed"));
				return;
			}
			router.push("/");
			router.refresh();
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string; errors?: { description?: string }[] }>;
			toast.error(axiosError.response?.data?.message || t("auth.registrationFailed"), {
				description: axiosError.response?.data?.errors?.[0]?.description,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div className="space-y-1.5">
				<label htmlFor="name" className="required block text-sm font-medium text-fg">
					{t("auth.name")}
				</label>
				<TextInput id="name" name="name" type="text" value={name} onValueChange={setName} placeholder={t("auth.namePlaceholder")} required />
			</div>

			<div className="space-y-1.5">
				<label htmlFor="email" className="required block text-sm font-medium text-fg">
					{t("auth.email")}
				</label>
				<TextInput id="email" name="email" type="email" value={email} onValueChange={setEmail} placeholder={t("auth.emailPlaceholder")} required />
			</div>

			<div className="space-y-1.5">
				<label htmlFor="password" className="required block text-sm font-medium text-fg">
					{t("auth.password")}
				</label>
				<TextInput id="password" name="password" type="password" value={password} onValueChange={setPassword} placeholder={t("auth.passwordPlaceholder")} required />
			</div>

			<div className="space-y-1.5">
				<label htmlFor="confirmPassword" className="required block text-sm font-medium text-fg">
					{t("auth.confirmPassword")}
				</label>
				<TextInput id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onValueChange={setConfirmPassword} placeholder={t("auth.passwordPlaceholder")} required />
			</div>

			<div className="flex items-center gap-2">
				<input
					id="acceptTerms"
					type="checkbox"
					checked={acceptTerms}
					onChange={(e) => setAcceptTerms(e.target.checked)}
					className="size-4 rounded border-line text-brand accent-[var(--brand-color)] focus:ring-brand"
					required
				/>
				<label htmlFor="acceptTerms" className="text-sm text-fg">
					{t("auth.acceptTerms")}
				</label>
			</div>

			<Button type="submit" icon={UserPlus} size="lg" block loading={loading}>
				{configuration?.storeName ? t("auth.registerAction", { storeName: configuration.storeName }) : t("auth.registerActionFallback")}
			</Button>
		</form>
	);
}
