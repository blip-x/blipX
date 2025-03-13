"use client";

import { useGetOrCreateConversation } from "@/features/conversation/api/use-get-or-create-conversation";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useEffect, useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { AlertTriangle, Loader } from "lucide-react";
import { Conversation } from "./conversation";

const MemberIdPage = () => {
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);

  const { data, mutate, isPending } = useGetOrCreateConversation();

  useEffect(() => {
    mutate({
      workspaceId,
      memberId
    }, 
    {
      onSuccess(data) {
        setConversationId(data);
      },
      onError(err) {
        toast.error("Failed to create or get conversation")
      }
    }
  );
  }, [workspaceId, memberId, mutate]);

  if(isPending) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground"/>
      </div>
    )
  }

  if(!conversationId) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <AlertTriangle className="size-6 text-muted-foreground"/>
        <span className="text-sm text-muted-foreground">
          Conversation not found
        </span>
      </div>
    )
  }
  return ( 
    <Conversation id={conversationId} />
   );
}
 
export default MemberIdPage;