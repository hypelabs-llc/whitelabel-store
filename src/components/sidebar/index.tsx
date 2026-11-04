import SidebarBrand from "./SidebarBrand";
import Nav from "./Nav";
import UserMenu from "./UserMenu";

/**
 * Desktop sidebar: vertical app shell navigation. Hidden below `md`, where the top bar's menu
 * button opens the mobile drawer instead. Branding, nav visibility and account come from the
 * same tenant configuration / session the old horizontal header used.
 */
export default function Sidebar() {
	return (
		<aside className="hidden h-full w-[260px] shrink-0 flex-col gap-4 border-r border-line bg-surface px-4 py-5 md:flex">
			<SidebarBrand />
			<div className="flex-1 overflow-y-auto">
				<Nav />
			</div>
			<UserMenu />
		</aside>
	);
}
