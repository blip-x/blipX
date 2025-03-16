import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api";

interface Props {
    roomId?: Id<"rooms">,
    workspaceId?: Id<"workspaces">,
    conversationId?: Id<"conversations">
}
export const useGetShapes = ({
  roomId,
  workspaceId,
  conversationId
}: Props) => {
  const data = useQuery(api.shapes.get, { roomId, workspaceId, conversationId });
  const isLoading = data === undefined;
  return { data, isLoading };
}