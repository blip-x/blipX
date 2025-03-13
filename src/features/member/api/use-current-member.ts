import { useQuery } from "convex/react"
import { Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api";

interface UserCurrentMemberProps {
  workspaceId: Id<"workspaces">
}
export const useCurrentMember = ({ workspaceId }: UserCurrentMemberProps) => {
  const data = useQuery(api.members.current, { workspaceId });
  const isLoading = data === undefined;
  return { data, isLoading };
}