import { useCallback, useMemo, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = { name: string, id: Id<"channels"> };
type ResponseType = Id<"channels"> | null;
type Options = {
  onSuccess?: (response: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
}

export const useUpdateChannel = () => {
  const mutation = useMutation(api.channels.update);
  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);

  const [status, setStatus] = useState<"pending"| "settled"| "error"| "success"| null>(null);
  const isPending = useMemo(() => status === "pending", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);

  const mutate = useCallback(async (values: RequestType, options?: Options) => {
      try {
        setData(null);
        setError(null);

        setStatus("pending");

        const response = await mutation(values);
        options?.onSuccess?.(response as ResponseType);
        return response;
      } catch (error) {
        setStatus("error");
        options?.onError?.(error as Error);
        if(options?.throwError) throw error;
      } finally {
        setStatus("settled");
        options?.onSettled?.();
      }
    }, [mutation]);
  return {
    mutate,
    data,
    error,
    isPending,
    isSettled,
    isError,
    isSuccess
  };
}