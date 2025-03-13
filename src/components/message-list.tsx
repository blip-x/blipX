import { GetMessagesByReturnType } from "@/features/message/api/use-get-messages";
import { differenceInMinutes, format, isToday, isYesterday } from 'date-fns';
import { Message } from "./message";
import { ChannelHero } from "./channel-hero";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useCurrentMember } from "@/features/member/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { ConversationHero } from "./conversation-hero";

interface MessageListProps {
  memberName?: string;
  memberImage?: string;
  channelName?: string;
  channelCreationTime?: number;
  variant?: "channel" | "conversation" | "thread";
  data: GetMessagesByReturnType | undefined;
  loadMore: () => void;
  isLoadingMore: boolean;
  canLoadMore: boolean;
}
function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  if(isToday(date)) {
    return "Today";
  }
  if(isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "EEEE MMMM d");
}

const TIME_THRESHOLD = 5;
export const MessageList = ({
  memberName,
  memberImage,
  channelCreationTime,
  channelName,
  variant = "channel",
  data,
  loadMore,
  isLoadingMore,
  canLoadMore
}: MessageListProps) => {
  const [edittingId, setEdittingId] = useState<Id<"messages"> | null>(null);
  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });

  const groupedMessage = data?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");
      if(!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].unshift(message);
      return groups;
    }, 
    {} as Record<string, typeof data>
  )
  return (
    <div className="flex flex-1 flex-col-reverse pb-4 overflow-y-auto message-scrollbar">
      {Object.entries(groupedMessage || {}).map(([dateKey, messages]) => (
        <div key={dateKey}>
          <div className="text-center my-2 relative">
            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300 "/>
            <span className="relative inline-block border border-gray-300 bg-white px-4 py-1 rounded-full text-xs shadow-sm">
              {formatDateLabel(dateKey)}
            </span>
          </div>
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const isCompact = 
              prevMessage &&
              prevMessage.user._id === message.user._id &&
              differenceInMinutes(
                new Date(prevMessage._creationTime),
                new Date(message._creationTime)
              ) < TIME_THRESHOLD;
            return (
              <Message 
                key={message._id}
                id={message._id}
                memberId={message.memberId}
                authorImage={message.user.image}
                isAuthor={message.memberId === currentMember?._id}
                authorName={message.user.name}
                reactions={message.reactions}
                body={message.body}
                image={message.image}
                updatedAt={message.updatedAt}
                createdAt={message._creationTime}
                threadCount={message.threadCount}
                threadImage={message.threadImage}
                threadName={message.threadName}
                threadTimestamp={message.threadTimestamp}
                isEditting={edittingId === message._id}
                setEdittingId={setEdittingId}
                hideThreadButton={variant === "thread" }
                isCompact={isCompact}
              />
            )
          })}
        </div>
      ))}
      <div 
        className="h-1"
        ref={(el) => {
          if(el) {
            const observer = new IntersectionObserver(
              ([entry]) => {
                if(entry.isIntersecting && canLoadMore) {
                  loadMore();
                }
              },
              { threshold: 1.0 }
            );
            observer.observe(el);

            return () => observer.disconnect();
          }
        }}
      />
      { isLoadingMore && (
        <div className="text-center my-2 relative">
          <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300 "/>
          <span className="relative inline-block border border-gray-300 bg-white px-4 py-1 rounded-full text-xs shadow-sm">
            <Loader className="animate-spin size-4 text-muted-foreground"/>
          </span>
        </div>  
      )}
      {variant === "channel" && channelName && channelCreationTime && (
        <ChannelHero 
          name={channelName}
          creationTime={channelCreationTime}
        />
      )}
      {variant === "conversation" && (
        <ConversationHero 
          name={memberName}
          memberImage={memberImage}
        />
      )}
    </div>
  )
}