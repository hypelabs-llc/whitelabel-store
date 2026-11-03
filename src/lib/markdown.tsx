import type { Components } from "react-markdown";

// Token-styled renderers for the markdown prose. Tailwind's typography `prose` classes aren't
// enabled in this build, so each element is mapped to the design-system tokens explicitly. Links
// use the per-tenant brand accent; everything else stays on the neutral grey chrome.
export const markdownComponents: Components = {
	h1: ({ children }) => (
		<h1 className="mt-8 mb-4 text-2xl font-semibold tracking-tight text-fg-strong first:mt-0">{children}</h1>
	),
	h2: ({ children }) => (
		<h2 className="mt-8 mb-3 border-b border-line pb-2 text-xl font-semibold tracking-tight text-fg-strong first:mt-0">
			{children}
		</h2>
	),
	h3: ({ children }) => (
		<h3 className="mt-6 mb-2 text-lg font-semibold text-fg-strong first:mt-0">{children}</h3>
	),
	h4: ({ children }) => (
		<h4 className="mt-5 mb-2 text-base font-semibold text-fg-strong first:mt-0">{children}</h4>
	),
	p: ({ children }) => <p className="my-4 text-sm leading-7 text-fg">{children}</p>,
	a: ({ children, href }) => (
		<a
			href={href}
			target={href?.startsWith("http") ? "_blank" : undefined}
			rel={href?.startsWith("http") ? "noreferrer" : undefined}
			className="font-medium text-brand underline decoration-brand/40 underline-offset-2 transition-colors hover:decoration-brand"
		>
			{children}
		</a>
	),
	ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6 text-sm leading-7 text-fg marker:text-muted">{children}</ul>,
	ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6 text-sm leading-7 text-fg marker:text-muted">{children}</ol>,
	li: ({ children }) => <li className="pl-1">{children}</li>,
	blockquote: ({ children }) => (
		<blockquote className="my-5 rounded-r-md border-l-2 border-brand bg-brand-soft py-2 pr-4 pl-4 text-sm italic text-fg">
			{children}
		</blockquote>
	),
	strong: ({ children }) => <strong className="font-semibold text-fg-strong">{children}</strong>,
	em: ({ children }) => <em className="italic">{children}</em>,
	hr: () => <hr className="my-8 border-line" />,
	code: ({ className, children }) => {
		const isBlock = (className ?? "").includes("language-");
		if (isBlock) {
			return <code className={`${className ?? ""} text-sm`}>{children}</code>;
		}
		return (
			<code className="rounded-sm border border-line bg-surface-muted px-1.5 py-0.5 font-mono text-[0.85em] text-fg-strong">
				{children}
			</code>
		);
	},
	pre: ({ children }) => (
		<pre className="my-5 overflow-x-auto rounded-lg border border-line bg-surface-muted p-4 font-mono text-sm leading-6 text-fg">
			{children}
		</pre>
	),
	table: ({ children }) => (
		<div className="my-5 overflow-x-auto rounded-lg border border-line">
			<table className="w-full border-collapse text-left text-sm">{children}</table>
		</div>
	),
	thead: ({ children }) => <thead className="bg-surface-muted">{children}</thead>,
	th: ({ children }) => (
		<th className="border-b border-line px-4 py-2.5 font-semibold text-fg-strong">{children}</th>
	),
	td: ({ children }) => <td className="border-b border-line px-4 py-2.5 align-top text-fg">{children}</td>,
	img: ({ src, alt }) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} className="my-5 max-w-full rounded-lg border border-line" />
	),
};
