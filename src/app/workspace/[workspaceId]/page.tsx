"use client";

import { useGetChannels } from "@/features/channel/api/use-get-channels";
import { useCreateChannelModal } from "@/features/channel/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/member/api/use-current-member";
import { useGetWorkspace } from "@/features/workspace/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

function WorkspaceIdPage() {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ id: workspaceId });
  const { data: channels, isLoading: channelsLoading } = useGetChannels({ workspaceId });
  const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
  const [open, setOpen] = useCreateChannelModal();
  const channel = useMemo(() => channels?.[0]?._id, [channels]);

  const isAdmin = useMemo(() => member?.role === "admin", [member?.role]);
  useEffect(() => {
    if(workspaceLoading || channelsLoading || !workspace || !member || memberLoading) return;

    if(channel) {
      router.push(`/workspace/${workspaceId}/channel/${channel}`);
    } else if(!open && isAdmin) {
      setOpen(true);
    }
  }, [workspaceLoading, channelsLoading, workspace, open, setOpen, router, channel, workspaceId, member, memberLoading, isAdmin]);

  if(workspaceLoading || channelsLoading || memberLoading) {
    return (
      <div className="flex flex-col h-full flex-1 items-center justify-center gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground"/>
      </div>
    )
  }
  if(!workspace || !member) {
    return (
      <div className="flex flex-col h-full flex-1 items-center justify-center gap-2">
        <AlertTriangle className="size-6 text-muted-foreground"/>
        <p className="text-sm text-muted-foreground">
          Workspace not found.
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col h-full flex-1 items-center justify-center gap-2">
      <AlertTriangle className="size-6 text-muted-foreground"/>
      <p className="text-sm text-muted-foreground">
        No channels found.
      </p>
    </div>
  );
}

export default WorkspaceIdPage;