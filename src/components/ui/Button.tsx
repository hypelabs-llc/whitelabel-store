"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "light";
type Size = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
	/** Leading icon (lucide). Matches Tremor's `icon` prop. */
	icon?: LucideIcon;
	iconPosition?: "left" | "right";
	variant?: Variant;
	size?: Size;
	loading?: boolean;
	/** Full width. */
	block?: boolean;
	/** Tremor compatibility: "red" renders the destructive style. Other values fall back to primary. */
	color?: "red" | string;
}

const SIZES: Record<Size, string> = {
	xs: "h-8 px-3 text-xs gap-1.5",
	sm: "h-9 px-3.5 text-sm gap-2",
	md: "h-10 px-4 text-sm gap-2",
	lg: "h-12 px-6 text-sm gap-2.5",
};

const ICON_SIZE: Record<Size, number> = { xs: 13, sm: 14, md: 15, lg: 17 };

function variantClasses(variant: Variant, color?: string): string {
	if (color === "red") {
		return "bg-red-600 text-white hover:bg-red-700 border border-transparent";
	}
	switch (variant) {
		case "secondary":
			return "bg-surface text-fg border border-line hover:bg-surface-muted";
		case "light":
			return "bg-transparent text-brand border border-transparent hover:bg-brand-soft";
		case "primary":
		default:
			return "bg-brand text-brand-contrast border border-transparent hover:opacity-90";
	}
}

/** App button. API-compatible with the Tremor <Button> props the codebase uses (icon/loading/variant/size/color). */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ icon: Icon, iconPosition = "left", variant = "primary", size = "md", loading = false, block = false, color, className, children, disabled, ...rest },
	ref,
) {
	const iconEl = loading ? (
		<Loader2 size={ICON_SIZE[size]} className="animate-spin" aria-hidden="true" />
	) : Icon ? (
		<Icon size={ICON_SIZE[size]} aria-hidden="true" />
	) : null;

	return (
		<button
			ref={ref}
			disabled={disabled || loading}
			className={clsx(
				"inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-colors",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
				"disabled:cursor-not-allowed disabled:opacity-50 disabled:ring-0 disabled:focus-visible:ring-0",
				SIZES[size],
				variantClasses(variant, color),
				block && "w-full",
				className,
			)}
			{...rest}
		>
			{iconPosition === "left" ? iconEl : null}
			{children ? <span className="truncate">{children}</span> : null}
			{iconPosition === "right" ? iconEl : null}
		</button>
	);
});

export default Button;
