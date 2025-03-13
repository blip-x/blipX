import { useCurrentMember } from "@/features/member/api/use-current-member";
import { useGetWorkspace } from "@/features/workspace/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, HashIcon, Loader, MessageSquareText, SendHorizonal } from "lucide-react";
import { WorkspaceHeader } from "./workspace-header";
import { SidebarItem } from "./sidebar-item";
import { useGetChannels } from "@/features/channel/api/use-get-channels";
import { WorkspaceSection } from "./workspace-section";
import { useGetMembers } from "@/features/member/api/use-get-members";
import { UserItem } from "./user-item";
import { useCreateChannelModal } from "@/features/channel/store/use-create-channel-modal";
import { useChannelId } from "@/hooks/use-channel-id";
import { useMemberId } from "@/hooks/use-member-id";


export const WorkspaceSidebar = () => {
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();
  const [_open, setOpen] = useCreateChannelModal();
  const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ id: workspaceId });
  const { data: channels, isLoading: channelsLoadig } = useGetChannels({ workspaceId });
  const { data: members, isLoading: membersLoading } = useGetMembers({ workspaceId });

  if(memberLoading || workspaceLoading) {
    return (
      <div className="h-full flex items-center justify-center flex-col bg-[#5E2C5F] ">
        <Loader className="size-5 animate-spin text-white"/>
      </div>
  )};
  if(!workspace || !member) {
    return (
      <div className="h-full flex items-center justify-center flex-col bg-[#5E2C5F] text-center">
        <AlertTriangle className="size-5 text-white"/>
        <p className="text-sm text-white">
          Workspace not found
        </p>
      </div>
  )};

  return (
    <div className="h-full flex flex-col bg-[#5E2C5F]">
      <WorkspaceHeader workspace={workspace} isAdmin={member.role === "admin"} />
      {/* <div className="flex flex-col px-2 mt-3">
        <SidebarItem 
          label="Threads"
          icon={MessageSquareText}
          id={"Threads"}
          />
        <SidebarItem 
          label="Drafts & Sent"
          icon={SendHorizonal}
          id={"drafts"}
        />
      </div> */}
      <WorkspaceSection
          label={"Channels"}
          hint={"New Channel"}
          onNew={member.role === "admin" ? () => setOpen(true) : undefined}
        >
          {channels?.map(item => (
            <SidebarItem 
              key={item._id}
              label={item.name}
              icon={HashIcon}
              id={item._id}
              variant={channelId === item._id ? "active" : "default"}
            />
          ))}
        </WorkspaceSection>
        <WorkspaceSection
          label={"Direct Messages"}
          hint={"New Message"}
          onNew={() => {}}
        >
          {members?.map(item => (
            <UserItem 
              key={item._id}
              label={item.user.name}
              id={item._id}
              image={item.user.image}
              variant={item._id === memberId? "active": "default"}
            />
          ))}
        </WorkspaceSection>
    </div>
  )
}