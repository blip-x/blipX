import dynamic from "next/dynamic";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Hint } from "./hint";
import { format, isToday, isYesterday } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { useUpdateMessage } from "@/features/message/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRemoveMessage } from "@/features/message/api/use-remove-message";
import { useConfirm } from "@/hooks/use-confirm";
import { useToggleReaction } from "@/features/reaction/api/use-toggle-reaction";
import { Reactions } from "./reactions";
import { usePanel } from "@/hooks/use-panel";
import { ThreadBar } from "./thread-bar";

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });
interface MessageProps {
	id: Id<"messages">;
	memberId: Id<"members">;
	authorName?: string;
	authorImage?: string;
	isAuthor: boolean;
	reactions: Array<
		Omit<Doc<"reactions">, "memberId"> & {
			count: number;
			memberIds: Id<"members">[];
		}
	>;
	body: Doc<"messages">["body"];
	image: string | null | undefined;
	createdAt: Doc<"messages">["_creationTime"];
	updatedAt: Doc<"messages">["updatedAt"];
	isEditting: boolean;
	setEdittingId: (id: Id<"messages"> | null) => void;
	isCompact?: boolean;
	hideThreadButton?: boolean;
	threadCount?: number;
	threadTimestamp?: number;
  threadName?: string;
	threadImage?: string;
}

function formatFullTime(date: Date) {
	return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
}
export const Message = ({
	id,
	memberId,
	authorImage,
	authorName = "Member",
	isAuthor,
	reactions,
	body,
	image,
	createdAt,
	updatedAt,
	isEditting,
	setEdittingId,
	isCompact,
	hideThreadButton,
	threadCount,
	threadImage,
  threadName,
	threadTimestamp,
}: MessageProps) => {
	const { parentMessageId, onOpenMessage, onOpenProfile, onClose } = usePanel();
	const [ConfirmDialog, confirm] = useConfirm({
		title: "Delete Message",
		message:
			"Are you sure you want to delete this message? This action is irreversible.",
	});
	const { mutate: updateMessage, isPending: isUpdateMessage } =
		useUpdateMessage();
	const { mutate: removeMessage, isPending: isRemovingMessage } =
		useRemoveMessage();
	const { mutate: toggleReaction, isPending: isTogglingReaction } =
		useToggleReaction();
	const isPending = isUpdateMessage || isTogglingReaction;

	async function handleReaction(value: string) {
		toggleReaction(
			{ messageId: id, value },
			{
				onError: () => {
					toast.error("Failed to add reaction");
				},
			}
		);
	}
	async function handleRemove() {
		const ok = await confirm();
		if (!ok) return;
		removeMessage(
			{ id },
			{
				onSuccess: () => {
					toast.success("Message Deleted");

					if (parentMessageId === id) {
						onClose();
					}
				},
				onError: () => {
					toast.error("Failed to delete message");
				},
			}
		);
	}
	const handleUpdate = ({ body }: { body: string }) => {
		updateMessage(
			{ id, body },
			{
				onSuccess: () => {
					toast.success("Message Updated");
				},
				onError: () => {
					toast.error("Failed to update message");
				},
			}
		);
		setEdittingId(null);
	};
	if (isCompact) {
		return (
			<>
				<ConfirmDialog />
				<div
					className={cn(
						"flex flex-col p-1.5 px-5 group hover:bg-gray-100/60 relative gap-2",
						isEditting && "bg-[#f2c74433] hover:bg-[#f2c74433]",
						isRemovingMessage &&
							"bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
					)}
				>
					<div className="flex items-start gap-2">
						<Hint label={formatFullTime(new Date(createdAt))}>
							<button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
								{format(new Date(createdAt), "hh:mm")}
							</button>
						</Hint>
						{isEditting ? (
							<div className="w-full h-full bg-white">
								<Editor
									onSubmit={handleUpdate}
									variant="update"
									disabled={isPending}
									defaultValue={JSON.parse(body)}
								/>
							</div>
						) : (
							<div className="flex w-full flex-col">
								<Renderer value={body} />
								<Thumbnail url={image} />
								{updatedAt && (
									<span className="text-xs text-muted-foreground">
										(edited)
									</span>
								)}
								<Reactions data={reactions} onChange={handleReaction} />
								<ThreadBar
									count={threadCount}
									image={threadImage}
									timestamp={threadTimestamp}
                  name={threadName}
                  onClick={() => onOpenMessage(id)}
								/>
							</div>
						)}
					</div>
					{!isEditting && (
						<Toolbar
							isAuthor={isAuthor}
							isPending={isPending}
							handleEdit={() => setEdittingId(id)}
							handleThread={() => onOpenMessage(id)}
							handleDelete={handleRemove}
							handleReaction={handleReaction}
							hideThreadButton={hideThreadButton}
						/>
					)}
				</div>
			</>
		);
	}
	const icon = authorName.charAt(0).toUpperCase();

	return (
		<>
			<ConfirmDialog />
			<div
				className={cn(
					"flex flex-col p-1.5 px-5 group hover:bg-gray-100/60 relative gap-2",
					isEditting && "bg-[#f2c74433] hover:bg-[#f2c74433]",
					isRemovingMessage &&
						"bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
				)}
			>
				<div className="flex items-start gap-2">
					<button onClick={() => onOpenProfile(memberId)}>
						<Avatar>
							<AvatarImage src={authorImage} />
							<AvatarFallback>{icon}</AvatarFallback>
						</Avatar>
					</button>
					{isEditting ? (
						<div className="w-full h-full bg-white">
							<Editor
								onSubmit={handleUpdate}
								variant="update"
								disabled={isPending}
								defaultValue={JSON.parse(body)}
							/>
						</div>
					) : (
						<div className="flex flex-col w-full overflow-hidden">
							<div className="text-sm">
								<button
									className="font-bold hover:underline text-primary"
									onClick={() => onOpenProfile(memberId)}
								>
									{authorName}
								</button>
								<span>&nbsp; &nbsp;</span>
								<Hint label={formatFullTime(new Date(createdAt))}>
									<button className="text-xs text-muted-foreground hover:underline">
										{format(new Date(createdAt), "h:mm a")}
									</button>
								</Hint>
							</div>
							<Renderer value={body} />
							<Thumbnail url={image} />
							{updatedAt && (
								<span className="text-xs text-muted-foreground">(edited)</span>
							)}
							<Reactions data={reactions} onChange={handleReaction} />
							<ThreadBar
								count={threadCount}
								image={threadImage}
								timestamp={threadTimestamp}
                name={threadName}
                onClick={() => onOpenMessage(id)}
							/>
						</div>
					)}
				</div>
				{!isEditting && (
					<Toolbar
						isAuthor={isAuthor}
						isPending={isPending}
						handleEdit={() => setEdittingId(id)}
						handleThread={() => onOpenMessage(id)}
						handleDelete={handleRemove}
						handleReaction={handleReaction}
						hideThreadButton={hideThreadButton}
					/>
				)}
			</div>
		</>
	);
};
