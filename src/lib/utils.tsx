"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { ispIconUrl, shortId } from "./index";

// Copy-to-clipboard button that briefly shows a "copied" state (green check) after a click.
export const CopyButton = ({ value }: { value: string }) => {
	const [copied, setCopied] = useState(false);
	const handleCopy = () => {
		navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};
	return (
		<button
			type={"button"}
			onClick={handleCopy}
			aria-label={copied ? "Copied" : "Copy"}
			className={"text-muted transition-colors hover:text-brand"}
		>
			{copied ? <Check className={"h-3.5 w-3.5 text-brand"} /> : <Copy className={"h-3.5 w-3.5"} />}
		</button>
	);
};

export const CopyableId = ({ id }: { id: string }) => (
	<span className={"inline-flex items-center gap-1.5 font-mono text-sm"}>
		#{shortId(id)}
		<CopyButton value={id} />
	</span>
);

export const locationIcon = (isoCode: string, dimmed: boolean = false) => (
	<img src={`/images/flags/${isoCode.toLowerCase()}.svg`} alt={isoCode} className={`w-4 h-4 mr-2 ${dimmed ? "grayscale" : ""}`} />
);

export const ispIcon = (ispId: string, dimmed: boolean = false) => (
	<img src={ispIconUrl(ispId)} alt={""} className={`w-4 h-4 mr-2 ${dimmed ? "grayscale" : ""}`} />
);
