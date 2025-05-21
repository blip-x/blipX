import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

interface UseCurrentRoomProps {
  workspaceId: Id<"workspaces">;
}
export const useCurrentRoom = ({workspaceId}: UseCurrentRoomProps) => {
  const data = useQuery(api.rooms.get, {workspaceId})
  const isLoading = data === undefined;
  return { data, isLoading };
}