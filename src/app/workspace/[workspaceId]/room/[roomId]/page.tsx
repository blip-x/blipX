"use client";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import Canvas from "@/features/canvas/components/Canvas";
import { useCurrentMember } from "@/features/member/api/use-current-member";

export default function RoomIdPage({
    params
}: {
    params: { roomId: string }
}) {
    const roomId = params.roomId as Id<"rooms">;
    const workspaceId = useWorkspaceId();
    const {data: currentMember, isLoading } = useCurrentMember({ workspaceId });

    if(isLoading || !currentMember?._id) {
        return null;
    }

    return (
        <Canvas roomId={roomId} workspaceId={workspaceId} memberId={currentMember?._id} />
    )
}