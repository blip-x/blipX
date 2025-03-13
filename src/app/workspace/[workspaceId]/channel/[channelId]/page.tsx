"use client";

import { useGetChannel } from "@/features/channel/api/use-get-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { AlertTriangle, Loader } from "lucide-react";
import { Header } from "./_components/header";
import { ChatInput } from "./_components/chat-input";
import { useGetMessages } from "@/features/message/api/use-get-messages";
import { MessageList } from "@/components/message-list";


const ChannelIdPage = () => {
  const channelId = useChannelId();
  const { data: channel, isLoading: channelLoading } = useGetChannel({ id: channelId });
  const { results, status, loadMore } = useGetMessages({ channelId });
  if(channelLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex items-center justify-center flex-1">
        <Loader className="size-6 animate-spin text-muted-foreground"/>
      </div>
    )
  }
  if(!channel) {
    return (
      <div className="h-full flex flex-col gap-y-2 items-center justify-center flex-1">
        <AlertTriangle className="size-6 text-muted-foreground"/>
        <span className="text-sm text-muted-foreground">
          Channel not found.
        </span>
      </div>
    )
  }
  return ( 
    <div className="h-full flex flex-col">
      <Header title={channel.name}/>
      <MessageList 
        channelName={channel.name}
        channelCreationTime={channel._creationTime}
        loadMore={loadMore}
        data={results}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput placeholder={`Message # ${channel.name}`} />
    </div>
  );
}

export default ChannelIdPage;