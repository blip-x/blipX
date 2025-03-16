"use client"
import { useEffect, useRef } from "react";
import Canvas from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {

    return (
        <Canvas roomId={roomId} />
    )
}
