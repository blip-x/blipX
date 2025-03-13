import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { useGetMessage } from "../api/use-get-message";
import { Message } from "@/components/message";
import { useRef, useState } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/member/api/use-current-member";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useCreateMessage } from "@/features/message/api/use-create-message";
import { useChannelId } from "@/hooks/use-channel-id";
import { toast } from "sonner";
import { useGetMessages } from "../api/use-get-messages";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });
interface ThreadProps {
	messageId: Id<"messages">;
	onClose: () => void;
}
type RequestValueType = {
	workspaceId: Id<"workspaces">;
	channelId: Id<"channels">;
	parentMessageId: Id<"messages">;
	body: string;
	image?: Id<"_storage">;
};

function formatDateLabel(dateStr: string) {
	const date = new Date(dateStr);
	if (isToday(date)) {
		return "Today";
	}
	if (isYesterday(date)) {
		return "Yesterday";
	}
	return format(date, "EEEE MMMM d");
}

const TIME_THRESHOLD = 5;

export const Thread = ({ messageId, onClose }: ThreadProps) => {
	const workspaceId = useWorkspaceId();
	const channelId = useChannelId();
	const editorRef = useRef<Quill | null>(null);
	const [editorKey, setEditorKey] = useState(0);
	const [isPending, setIsPending] = useState(false);
	const { data: currentMember } = useCurrentMember({ workspaceId });
	const [edittingId, setEdittingId] = useState<Id<"messages"> | null>(null);
	const { data: message, isLoading: loadingMessage } = useGetMessage({
		id: messageId,
	});
	const { mutate: createMessage } = useCreateMessage();
	const { mutate: generateUploadUrl } = useGenerateUploadUrl();
	const { results, status, loadMore } = useGetMessages({
		channelId,
		parentMessageId: messageId,
	});

	const isLoadingMore = status === "LoadingMore";
	const canLoadMore = status === "CanLoadMore";

	async function handleSubmit({
		body,
		image,
	}: {
		body: string;
		image: File | null;
	}) {
		try {
			setIsPending(true);
			editorRef?.current?.enable(false);
			const values: RequestValueType = {
				workspaceId,
				channelId,
				parentMessageId: messageId,
				body,
				image: undefined,
			};

			if (image) {
				const url = await generateUploadUrl({}, { throwError: true });
				if (!url) {
					throw new Error("Failed to generate upload url");
				}
				const result = await fetch(url, {
					method: "POST",
					headers: { "Content-Type": image.type },
					body: image,
				});

				if (!result.ok) {
					throw new Error("failed to send message");
				}
				const { storageId } = await result.json();

				values.image = storageId;
			}
			createMessage(values, { throwError: true });
			editorRef?.current?.setContents(JSON.parse("{}"));
		} catch (e) {
			toast.error("Failed to send message");
		} finally {
			setIsPending(false);
			editorRef?.current?.enable(true);
			editorRef?.current?.focus();
			// setEditorKey(prevKey => prevKey + 1);
		}
	}

	const groupedMessage = results?.reduce(
		(groups, message) => {
			const date = new Date(message._creationTime);
			const dateKey = format(date, "yyyy-MM-dd");
			if (!groups[dateKey]) {
				groups[dateKey] = [];
			}
			groups[dateKey].unshift(message);
			return groups;
		},
		{} as Record<string, typeof results>
	);

	if (loadingMessage || status === "LoadingFirstPage") {
		return (
			<div className="h-full flex flex-col ">
				<div className="flex h-[49px] justify-between items-center px-4 border-b">
					<p className="font-bold text-lg">Thread</p>
					<Button variant={"ghost"} size="iconSm" onClick={onClose}>
						<XIcon className="size-5 stroke-[1.5]" />
					</Button>
				</div>
				<div className="h-full flex items-center justify-center">
					<Loader className="size-5 animate-spin  text-muted-foreground" />
				</div>
			</div>
		);
	}

	if (!message) {
		return (
			<div className="h-full flex flex-col ">
				<div className="flex h-[49px] justify-between items-center px-4 border-b">
					<p className="font-bold text-lg">Thread</p>
					<Button variant={"ghost"} size="iconSm" onClick={onClose}>
						<XIcon className="size-5 stroke-[1.5]" />
					</Button>
				</div>
				<div className="h-full flex flex-col items-center justify-center gap-y-2">
					<AlertTriangle className="size-5 text-muted-foreground" />
					<p className="text-xs text-muted-foreground">Message not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col ">
			<div className="flex h-[49px] justify-between items-center px-4 border-b">
				<p className="font-bold text-lg">Thread</p>
				<Button variant={"ghost"} size="iconSm" onClick={onClose}>
					<XIcon className="size-5 stroke-[1.5]" />
				</Button>
			</div>
			<div className="flex flex-1 flex-col-reverse pb-4 overflow-y-auto message-scrollbar">
				{Object.entries(groupedMessage || {}).map(([dateKey, messages]) => (
					<div key={dateKey}>
						<div className="text-center my-2 relative">
							<hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300 " />
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
									hideThreadButton
									isCompact={isCompact}
								/>
							);
						})}
					</div>
				))}
				<div
					className="h-1"
					ref={(el) => {
						if (el) {
							const observer = new IntersectionObserver(
								([entry]) => {
									if (entry.isIntersecting && canLoadMore) {
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
				{isLoadingMore && (
					<div className="text-center my-2 relative">
						<hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300 " />
						<span className="relative inline-block border border-gray-300 bg-white px-4 py-1 rounded-full text-xs shadow-sm">
							<Loader className="animate-spin size-4 text-muted-foreground" />
						</span>
					</div>
				)}
				<Message
					hideThreadButton
					body={message.body}
					image={message.image}
					isAuthor={currentMember?._id === message.memberId}
					id={message._id}
					createdAt={message._creationTime}
					updatedAt={message.updatedAt}
					isEditting={edittingId === message._id}
					setEdittingId={setEdittingId}
					memberId={message.memberId}
					authorName={message.user.name}
					authorImage={message.user.image}
					reactions={message.reactions}
				/>
			</div>
			<div className="px-4">
				<Editor
					key={editorKey}
					innerRef={editorRef}
					onSubmit={handleSubmit}
					disabled={isPending}
					placeholder="Reply.."
				/>
			</div>
		</div>
	);
};
