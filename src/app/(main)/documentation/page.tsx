import type { Metadata } from "next";
import DocumentationView from "./DocumentationView";

export const metadata: Metadata = {
	title: "Documentation",
	description: "Guides and reference for setting up and using your proxies.",
};

export default function Page() {
	return <DocumentationView />;
}
