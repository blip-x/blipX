import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api";

interface Props {
    roomId: Id<"rooms">,
    workSpaceId: Id<"workspaces">,
    conversationId: Id<"conversations">
}
export const useGetMessage = ({
  roomId,
  workSpaceId,
  conversationId
}: Props) => {
  const data = useQuery(api.messages.getById, { id });
  const isLoading = data === undefined;
  return { data, isLoading };
}