
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,

} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCreateWorkspaceModal } from '../store/use-create-workspace-modal';
import { useCreateWorkspace } from '../api/use-create-workspace';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
export const CreateWorkspaceModal = () => {
  const [workspaceName, setWorkspaceName] = useState("");
  const router = useRouter();
  const [open, setOpen] = useCreateWorkspaceModal();
  const { mutate, isPending } = useCreateWorkspace();
  function handleClose() {
    setOpen(false);
    setWorkspaceName("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    mutate({ workspaceName }, {
      onSuccess: (response) => {
        toast.success("Workspace created successfully");
        router.push(`/workspace/${response}`);
        handleClose();
      }
    });
  }
  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>
        <form className='space-y-4' onSubmit={handleSubmit}>
          <Input 
            autoFocus
            required
            value={workspaceName}
            onChange={(e)=> setWorkspaceName(e.target.value)}
            disabled={isPending}
            placeholder='Workspace Name e.g."Personal", "Home", "Work"'
          />
          <div className='flex justify-end'>
            <Button 
              disabled={isPending}
            >
              Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}