"use client";

import { Button } from "@/components/ui/button";
import { useGetWorkspaceInfo } from "@/features/workspace/api/use-get-workspace-info";
import { useJoin } from "@/features/workspace/api/use-join";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import VerificationInput from 'react-verification-input';
import { toast } from "sonner";

const JoinPage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetWorkspaceInfo({ id: workspaceId });
  const { mutate, isPending } = useJoin();

  const isMember = useMemo(() => data?.isMember, [data?.isMember]);

  useEffect(() => {
    if(isMember) {
      router.replace(`/workspace/${workspaceId}`);;
    } 
  }, [isMember, router, workspaceId])
  function handleJoin(value: string) {
    mutate({ workspaceId, joinCode: value }, {
      onSuccess: (id) => {
        router.replace(`/workspace/${workspaceId}`);
        toast.success("Workspace joined."); 
      },
      onError: () => {
        toast.error("Failed to join the workspace.")
      }
    })
  }
  if(isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground"/>
      </div>
    );
  }
  return ( 
    <div className="flex flex-col items-center justify-center h-full gap-y-8 shadow-md bg-white p-8 rounded-lg">
      <Image src={"/logo.svg"} width={60} height={60} alt="Logo"/>
      <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <h1 className="text-2xl font-bold">
            Join Workspace
          </h1>
          <p className="text-md text-muted-foreground">
            Enter the workspace code to join.
          </p>
        </div>
        <VerificationInput 
          onComplete={handleJoin}
          length={6}
          classNames={{
            container: cn("flex gap-x-2", isPending && "cursor-not-allowed opacity-50"),
            character: "uppercase h-auto rounded-md border border-gray-300 text-gray-500 flex items-center justify-center text-lg font-medium",
            characterInactive: "bg-muted",
            characterSelected: "bg-white text-black",
            characterFilled: "bg-white text-black",
          }}
          autoFocus
        />
      </div>
      <div className="flex gap-x-4">
        <Button
          size={"lg"}
          variant={"outline"}
          asChild
        >
          <Link href={`/workspace/${workspaceId}`}>
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default JoinPage;