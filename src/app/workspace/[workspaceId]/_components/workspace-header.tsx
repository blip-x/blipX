import { 
  DropdownMenu ,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Doc } from "../../../../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { ChevronDown, ListFilter, SquarePen } from "lucide-react"
import { Hint } from "@/components/hint"
import { PreferencesModal } from "./preferences-modal"
import { useState } from "react"
import { InviteModal } from "./invite-modal"

interface WorkspaceHeaderProps {
  workspace: Doc<"workspaces">,
  isAdmin?: boolean
}
export const WorkspaceHeader = ({ workspace, isAdmin }: WorkspaceHeaderProps) => {
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <InviteModal 
        open={inviteOpen}
        setOpen={setInviteOpen}
        name={workspace.name}
        joinCode={workspace.joinId}
      />
      <PreferencesModal  open={preferencesOpen} setOpen={setPreferencesOpen} initialValue={workspace.name} />
      <div className="flex items-center justify-between h-[49px] px-4 gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"transparent"}
              className="font-semibold w-auto p-1.5 text-lg overflow-hidden"
              size={"sm"}
            >
              <span className="truncate">
                {workspace.name}
              </span>
              <ChevronDown className="size-4 ml-1 shrink-0"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start" side="bottom">
            <DropdownMenuItem
              className="cursor-pointer capitalize"
            >
              <div className="size-9 relative overflow-hidden bg-[#616061] flex items-center justify-center text-white font-semibold mr-2 text-xl rounded-md ">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start">
                <p className="font-bold">
                {workspace.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Active Workspace
                </p>
              </div>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer py-2"
                  onClick={() => setInviteOpen(true)}
                >
                  Invite people to {workspace.name}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer py-2"
                  onClick={() => setPreferencesOpen(true)}
                >
                  Preferences
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <div className="flex items-center gap-0.5">
          <Hint label="Filter conversations" side="bottom">
            <Button variant={"transparent"} size={"iconSm"}>
              <ListFilter className="size-4 "/>
            </Button>
          </Hint>
          <Hint label="New message" side="bottom">
            <Button variant={"transparent"} size={"iconSm"}>
              <SquarePen className="size-4 "/>
            </Button>
          </Hint>
        </div> */}
      </div>
    </>
  )
}