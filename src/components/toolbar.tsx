import { MessageSquareTextIcon, Pencil, Smile, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { Hint } from "./hint";
import { EmojiPopover } from "./emoji-popover";

type Props = {
  isAuthor: boolean;
  isPending: boolean;
  handleEdit: () => void;
  handleDelete: () => void;
  handleReaction: (value: string) => void;
  handleThread: () => void;
  hideThreadButton?: boolean;
}
export const Toolbar = ({
  isAuthor,
  isPending,
  handleDelete,
  handleEdit,
  handleReaction,
  handleThread,
  hideThreadButton
}: Props) => {
  return ( 
    <div className="absolute top-[50%] -translate-y-[50%] right-5">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity rounded-md shadow-sm border bg-white">
        <EmojiPopover
          hint="Emoji"
          onEmojiSelect={(emoji) => handleReaction(emoji.native)}
        >
          <Button
            variant="ghost"
            size="iconSm"
            disabled={isPending}
          >
            <Smile className="size-4" />
          </Button>
        </EmojiPopover>
        {!hideThreadButton && (
          <Hint label="Reply in thread">
            <Button
              variant="ghost"
              size="iconSm"
              disabled={isPending}
              onClick={handleThread}
            >
              <MessageSquareTextIcon className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <>
            <Hint label="Edit Message">
              <Button
                variant="ghost"
                size="iconSm"
                disabled={isPending}
                onClick={handleEdit}
              >
                <Pencil className="size-4" />
              </Button>
            </Hint>
            <Hint label="Delete Message">
              <Button
                variant="ghost"
                size="iconSm"
                disabled={isPending}
                onClick={handleDelete}
              >
                <Trash className="size-4" />
              </Button>
            </Hint>
          </>
        )}
      </div>
    </div>
  );
}