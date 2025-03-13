import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRemoveWorkspace } from "@/features/workspace/api/use-remove-workspace";
import { useUpdateWorkspace } from "@/features/workspace/api/use-update-workspace";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

interface PreferencesModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialValue: string;
}
export const PreferencesModal = ({
  open,
  setOpen,
  initialValue
}: PreferencesModalProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [value, setValue] = useState(initialValue);
  const [editOpen, setEditOpen] = useState(false);
  const { mutate: removeWorkspace, isPending: removeWorkspacePending } = useRemoveWorkspace();
  const { mutate: updateWorkspace, isPending: updateWorkspacePending } = useUpdateWorkspace();
  const [ConfirmDialog, confirm] = useConfirm({
    title: "Are you sure?",
    message: "This action is irreversible."
  });

  const editWorkspaceName = (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateWorkspace({ id: workspaceId, name: value }, {
      onSuccess: () => {
        setEditOpen(false);
        toast.success("Workspace renamed");
      }, onError: () => {
        toast.error("Failed to rename workspace")
      }
    })
  }
  const removeWorkspaceName = async () => {
    const ok = await confirm();
    if(!ok) return;
    
    removeWorkspace({ id: workspaceId }, {
      onSuccess: () => {
        setEditOpen(false);
        toast.success("Workspace Removed");
        router.replace("/");
      }, onError: () => {
        toast.error("Failed to remove workspace")
      }
    })
  }
  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 bg-white border-b">
            <DialogTitle>{value}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold ">
                      Workspace Name
                    </p>
                    <p className="text-sm font-semibold hover:underline text-[#1264a3]">
                      Edit
                    </p>
                  </div>
                  <p className="text-sm">
                    {value}
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename this workspace</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={editWorkspaceName}>
                  <Input 
                    disabled={updateWorkspacePending}
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    minLength={3}
                    maxLength={80}
                    placeholder='Workspace Name e.g."Personal", "Home", "Work"'
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant={"outline"} disabled={updateWorkspacePending}>Cancel</Button>
                    </DialogClose >
                    <Button type="submit" disabled={updateWorkspacePending}>
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <button
              disabled={removeWorkspacePending}
              onClick={removeWorkspaceName}
              className="flex items-center gap-x-2 px-5 py-4 text-rose-500 bg-white hover:bg-gray-50 rounded-lg border cursor-pointer "
            >
              <Trash className="size-4"/>
              <p className="text-sm font-semibold">Delete Workspace</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}