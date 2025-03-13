"use client";

import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { useGetWorkspace } from "@/features/workspace/api/use-get-workspace";
import { useGetWorkspaces } from "@/features/workspace/api/use-get-workspaces";
import { useCreateWorkspaceModal } from "@/features/workspace/store/use-create-workspace-modal";
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export const WorkspaceSwitcher = () => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const [_open, setOpen] = useCreateWorkspaceModal();
  const { data: workspaces, isLoading: workspacesLoading } = useGetWorkspaces();
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ id: workspaceId});

  const filterWorkspaces = workspaces?.filter(workspace => workspace._id !== workspaceId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#ABABAD] hover:bg-[#ABABAD]/80 rounded-md flex items-center justify-center text-xl text-slate-800 font-semibold size-9 overflow-hidden relative">
          {workspaceLoading ? 
            (
              <Loader className="size-4 animate-spin shrink-0"/>
            ): (
              <div>
                {workspace?.name?.charAt(0).toUpperCase()}
              </div>
            )
          }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="cursor-pointer flex flex-col items-start justify-start capitalize" onClick={() => router.push(`/workspace/${workspaceId}`)}>
          {workspace?.name}
          <span className="text-sm text-muted-foreground">
            Active Workspace
          </span>
        </DropdownMenuItem>
        {
          filterWorkspaces?.map((workspace) => (
            <DropdownMenuItem
              key={workspace._id}
              className="cursor-pointer capitalize overflow-hidden"
              onClick={() => router.push(`/workspace/${workspace._id}`)}
            >
              <div className="size-9 relative overflow-hidden bg-[#616061] text-white text-lg rounded-md flex items-center justify-center mr-2 font-semibold">
                {workspace.name?.charAt(0).toUpperCase()}
              </div>
              <p className="truncate">
                {workspace.name}
              </p>
            </DropdownMenuItem>
          ))
        }
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <div className="size-9 relative overflow-hidden bg-[#f2f2f2] text-slate-800 text-lg rounded-md flex items-center justify-center mr-2 font-semibold">
            <Plus className=""/>
          </div>
          Create Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}