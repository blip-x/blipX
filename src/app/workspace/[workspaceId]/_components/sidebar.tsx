import { UserButton } from "@/features/auth/components/user-button"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { SidebarButton } from "./sidebar-button"
import { Bell, Home, MessageSquare, MoreHorizontal } from "lucide-react"

export const Sidebar = () => {
  return (
    <aside className="w-[70px] h-full flex items-center flex-col gap-y-4 bg-[#481349] pt-[9px] pb-[4px] ">
      <WorkspaceSwitcher />
      <SidebarButton icon={Home} label="Home" isActive/>
      <SidebarButton icon={MessageSquare} label="DMs" />
      {/* <SidebarButton icon={Bell} label="Activity" /> */}
      {/* <SidebarButton icon={MoreHorizontal} label="More" /> */}
      <div className="flex flex-col gap-y-1 mt-auto items-center jusitfy-center ">
        <UserButton />
      </div>
    </aside>
  )
}