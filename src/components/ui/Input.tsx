"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

const base =
	"w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted " +
	"transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 " +
	"disabled:cursor-not-allowed disabled:opacity-50";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
	icon?: LucideIcon;
	/** Tremor-style change handler (value only). `onChange` also works. */
	onValueChange?: (value: string) => void;
	error?: boolean;
}

/** Text field. API-compatible with Tremor <TextInput> (icon, value, onValueChange, placeholder, type). */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
	{ icon: Icon, onValueChange, onChange, error, className, ...rest },
	ref,
) {
	const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
		onValueChange?.(e.target.value);
		onChange?.(e);
	};
	if (Icon) {
		return (
			<div className="relative">
				<Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
				<input ref={ref} onChange={handle} className={clsx(base, "pl-9", error && "border-red-500 focus:border-red-500 focus:ring-red-500/20", className)} {...rest} />
			</div>
		);
	}
	return <input ref={ref} onChange={handle} className={clsx(base, error && "border-red-500 focus:border-red-500 focus:ring-red-500/20", className)} {...rest} />;
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	onValueChange?: (value: string) => void;
	error?: boolean;
}

/** Multiline field. API-compatible with Tremor <Textarea>. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
	{ onValueChange, onChange, error, className, ...rest },
	ref,
) {
	const handle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		onValueChange?.(e.target.value);
		onChange?.(e);
	};
	return <textarea ref={ref} onChange={handle} className={clsx(base, "min-h-24 resize-y", error && "border-red-500", className)} {...rest} />;
});
