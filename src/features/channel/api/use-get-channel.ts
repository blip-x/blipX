import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api";

interface Props {
  id: Id<"channels">
}
export const useGetChannel = ({
  id
}: Props) => {
  const data = useQuery(api.channels.getById, { id });
  const isLoading = data === undefined;
  return { data, isLoading };
}