"use client";

import { useState } from "react";
import { Button, Dialog, DialogPanel, Flex, Icon, Metric, Subtitle } from "@tremor/react";
import { AlertTriangle } from "lucide-react";
import type { ElementType } from "react";
import { useTranslation } from "react-i18next";

export default function ConfirmDialog({ isOpen, title, message, confirmLabel, confirmIcon, confirmColor = "red", onConfirm, onClose }: {
	isOpen: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	confirmIcon?: ElementType;
	confirmColor?: "red" | "yellow" | "blue";
	onConfirm: () => void | Promise<void>;
	onClose: () => void;
}) {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const label = confirmLabel ?? t("common.confirm");

	const handleConfirm = () => {
		setLoading(true);
		Promise.resolve(onConfirm())
			.finally(() => setLoading(false))
			.finally(() => onClose());
	};

	return (
		<Dialog open={isOpen} onClose={onClose} static className={"z-[200]"}>
			<DialogPanel className={"max-w-sm w-full p-8 space-y-6"}>
				<div className={"space-y-3"}>
					<Flex justifyContent={"start"} className={"gap-3"}>
						<Icon size={"sm"} variant={"solid"} color={"red"} icon={AlertTriangle} />
						<Metric className={"text-tremor-content-strong dark:text-dark-tremor-content-strong"}>{title}</Metric>
					</Flex>
					<Subtitle className={"text-sm text-tremor-content dark:text-dark-tremor-content"}>{message}</Subtitle>
				</div>
				<Flex justifyContent={"end"} className={"gap-3"}>
					<Button className={"button-default"} onClick={onClose}>{t("common.dismiss")}</Button>
					<Button icon={confirmIcon} color={confirmColor} loading={loading} onClick={handleConfirm}>{label}</Button>
				</Flex>
			</DialogPanel>
		</Dialog>
	);
}
