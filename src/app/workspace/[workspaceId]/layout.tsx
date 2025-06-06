"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sidebar } from "./_components/sidebar";
import { Toolbar } from "./_components/toolbar";
import { WorkspaceSidebar } from "./_components/workspace-sidebar";
import { usePanel } from "@/hooks/use-panel";
import { Loader } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Thread } from "@/features/message/components/thread";
import { Profile } from "@/features/member/components/profile";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";

interface Props {
  children: React.ReactNode
}
const WorkspaceIdLayout = ({ children }: Props) => {
  const { parentMessageId, profileMemberId, onClose } = usePanel();
  const path = usePathname();
  const showCanvas = JSON.stringify(path).includes("room");

  const showPanel = !!parentMessageId || !!profileMemberId;
  return ( 
    <div className="h-full">
      {!showCanvas && <Toolbar />}
      {!showCanvas && <div className="flex h-[calc(100vh-40px)]">
        <Sidebar />
        <ResizablePanelGroup 
          direction="horizontal"
          autoSaveId="workspace-sidebar"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={11}
            className="bg-[#242626]/95"
          >
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle/>
          <ResizablePanel
            minSize={20}
            defaultSize={80}
          >
            {children}
          </ResizablePanel>
          {showPanel && (
            <>
              <ResizableHandle withHandle/>
              <ResizablePanel minSize={20} defaultSize={29}>
                {parentMessageId ? (
                  <Thread 
                    messageId={parentMessageId as Id<"messages">}
                    onClose={onClose}
                  />
                ) : profileMemberId ? (
                  <Profile
                    memberId={profileMemberId as Id<"members">}
                    onClose={onClose}
                  />
                ) : (
                  <div>
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>}
      {showCanvas &&
        <div>{children}</div>
      }
    </div>
  );
}

export default WorkspaceIdLayout;