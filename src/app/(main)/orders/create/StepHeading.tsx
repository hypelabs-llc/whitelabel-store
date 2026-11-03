// The step section heading (numbered index + title + subtitle). Presentational, no client state.
export function StepHeading({ index, title, subtitle }: { index: string; title: string; subtitle: string }) {
	return (
		<div className="mb-4">
			<div className="flex items-baseline gap-3">
				<span className="font-mono text-sm text-brand">{index}</span>
				<h2 className="text-xl font-semibold text-fg-strong">{title}</h2>
			</div>
			<p className="mt-1 text-sm text-muted">{subtitle}</p>
		</div>
	);
}
