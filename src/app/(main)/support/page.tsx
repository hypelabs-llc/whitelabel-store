import type { Metadata } from "next";
import SupportView from "./SupportView";

export const metadata: Metadata = {
	title: "Support",
	description: "Get help with your proxies or account from our support team.",
};

export default function Page() {
	return <SupportView />;
}
