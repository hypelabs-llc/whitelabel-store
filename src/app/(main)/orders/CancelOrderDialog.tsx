"use client";

import { type SubmitEvent, useState } from "react";
import { Button, Modal } from "@/components/ui";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import { cancelOrder } from "@/lib/actions/order";
import { useTranslation } from "react-i18next";

export default function CancelOrderDialog({ orderId, isOpen, onClose }: { orderId: string | null; isOpen: boolean; onClose: () => void }) {
	const { t } = useTranslation();
	const [immediate, setImmediate] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!orderId) return;
		setLoading(true);
		try {
			await cancelOrder(orderId, immediate);
			toast.success(t("cancelOrderDialog.success"));
			mutate("/api/orders");
			onClose();
		} catch {
			toast.error(t("cancelOrderDialog.fail"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal open={isOpen} onClose={onClose} title={t("cancelOrderDialog.title")}>
			<form onSubmit={handleSubmit} className={"space-y-6"}>
				<p className={"text-sm text-muted"}>{t("cancelOrderDialog.subtitle")}</p>

				<button
					type={"button"}
					role={"switch"}
					aria-checked={immediate}
					onClick={() => setImmediate((value) => !value)}
					className={"flex w-full items-center gap-3 text-left"}
				>
					<span className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors ${immediate ? "bg-brand" : "bg-line-strong"}`}>
						<span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${immediate ? "translate-x-5" : "translate-x-1"}`} />
					</span>
					<span className={"min-w-0"}>
						<span className={"block text-sm font-medium text-fg-strong"}>{t("cancelOrderDialog.immediate")}</span>
						<span className={"block text-xs text-muted"}>{t("cancelOrderDialog.immediateHelp")}</span>
					</span>
				</button>

				<div className={"flex justify-end gap-3"}>
					<Button type={"button"} variant={"secondary"} onClick={onClose}>
						{t("common.dismiss")}
					</Button>
					<Button type={"submit"} icon={XCircle} color={"red"} loading={loading}>
						{t("cancelOrderDialog.confirm")}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
