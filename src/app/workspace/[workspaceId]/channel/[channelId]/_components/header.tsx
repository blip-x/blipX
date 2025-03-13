
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useUpdateChannel } from "@/features/channel/api/use-update-channel";
import { useRemoveChannel } from "@/features/channel/api/use-remove-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useCurrentMember } from "@/features/member/api/use-current-member";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
}
export const Header = ({ title }: HeaderProps) => {
  const router = useRouter();
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const [value, setValue] = useState(title);
  const [editOpen, setEditOpen] = useState(false);
  const [ConfirmDialog, confirm] = useConfirm({
    title: "Delete this Channel?",
    message: "This will permanently delete this channel. This action is irreversible."
  })
  const { data: member } = useCurrentMember({ workspaceId });
  const { mutate: updateChannel, isPending: isUpdatingChannel } = useUpdateChannel()
  const { mutate: removeChannel, isPending: isRemovingChannel } = useRemoveChannel()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setValue(value);
  }
  function handleEditClose(value: boolean) {
    if(member?.role !== "admin") return;
    setEditOpen(value)
  }
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if(member?.role !== "admin") return;

    updateChannel({ id: channelId, name: value }, {
      onSuccess: () => {
        router.push(`/workspace/${workspaceId}`);
        toast.success("Channel renamed successfully");
      },
      onError: () => {
        toast.error("Failed to rename the channel")
      }
    })
  }

  async function handleDeleteChannel() {
    if(member?.role !== "admin") return;
    const ok = await confirm();
    if(!ok) return;

    removeChannel({ id: channelId }, {
      onSuccess: () => {
        router.push(`/workspace/${workspaceId}`)
        toast.success("Channel deleted successfully")
      },
      onError: () => {
        toast.error("Failed to delete channel")
      }
    })
  }
  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
      <ConfirmDialog />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={"ghost"}
            size={"sm"}
            className="text-lg font-semibold px-2 overflow-hidden w-auto"
          >
            <span className="truncate">
              # {title}
            </span>
            <FaChevronDown className="size-2.5 ml-2"/>
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle># {title}</DialogTitle>
          </DialogHeader>
          <div className="px-5 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={handleEditClose}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Channel Name</p>
                    {member?.role === "admin" && (
                      <p className="font-semibold hover:underline text-[#1264a3] text-sm">
                        Edit
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground"># {title}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename Channel</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input 
                    value={value}
                    onChange={handleChange}
                    disabled={isUpdatingChannel}
                    autoFocus
                    required
                    minLength={3}
                    maxLength={80}
                    placeholder="e.g. plan-budget"
                  />
                </form>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant={"outline"} disabled={isUpdatingChannel}>Close</Button>
                  </DialogClose>
                  <Button disabled={isUpdatingChannel}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {member?.role === "admin" && (
              <button
              disabled={isRemovingChannel}
              onClick={handleDeleteChannel}
              className="px-5 py-4 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer text-rose-600 flex items-center gap-x-2"
              >
                <TrashIcon className="size-4"/>
                <p className="text-sm font-semibold">Delete Channel</p>
              </button>
            )}
            
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}