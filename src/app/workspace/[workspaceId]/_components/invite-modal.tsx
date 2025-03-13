import { Button } from "@/components/ui/button";
import { 
  Dialog ,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useNewJoinCode } from "@/features/workspace/api/use-new-join-code";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { CopyIcon, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface InviteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  name: string;
  joinCode: string;
}
export const InviteModal = ({
  open,
  setOpen,
  name,
  joinCode
}: InviteModalProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useNewJoinCode();
  const [ConfirmDialog, confirm] = useConfirm({
    title: "Are you sure?",
    message: "This will generate a new invite code for this workspace",
  })
  function handleCopy() {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`
    navigator.clipboard.writeText(inviteLink).then(() => {
      toast.success("Invite link copied to clipboard")
    })
  }
  async function handleNewJoinCode() {
    const ok = await confirm();
    if(!ok) return;
    mutate({
      workspaceId
    }, {
      onSuccess: () => {
        toast.success("New Invite code generated")
      },
      onError: () => {
        toast.error("Failed to generate code.")
      }
    })
  }

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite people to {name}</DialogTitle>
            <DialogDescription>Use the code below to invite people to your workspace</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-10 gap-y-4">
            <p className="text-4xl font-bold uppercase tracking-widest">
              {joinCode}
            </p>
            <Button
              size={"sm"}
              variant={"ghost"}
              onClick={handleCopy}
            >
              Copy link 
              <CopyIcon className="size-4 ml-2"/>
            </Button>
          </div>
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isPending}
              variant={"outline"}
              onClick={handleNewJoinCode}
            >
              New Code 
              <RefreshCcw className="size-4 ml-2"/>
            </Button>
            <DialogClose asChild>
              <Button>
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}