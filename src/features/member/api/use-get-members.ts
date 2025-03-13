import { useQuery } from "convex/react"
import { Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api"

interface Props {
  workspaceId: Id<"workspaces">
}
export const useGetMembers = ({
  workspaceId
}: Props) => {
  const data = useQuery(api.members.get, { workspaceId });
  const isLoading = data === undefined;
  return { data, isLoading };
}