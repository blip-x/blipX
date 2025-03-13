"use client";

import { CreateChannelModal } from "@/features/channel/components/create-channel-modal";
import { CreateWorkspaceModal } from "@/features/workspace/components/create-workspace-modal";
import { useEffect, useState } from "react";

export const Modal = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if(!mounted) return null;
  
  return (
    <>
      <CreateChannelModal />
      <CreateWorkspaceModal />
    </>
  )
}