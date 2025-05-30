import { cva, type VariantProps } from "class-variance-authority";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const userItemVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-4 text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc]",
        active: "text-[#333] bg-white/90 hover:bg-white-90"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)
type Props = {
  id: Id<"members">
  label?: string;
  image?: string;
  variant?: VariantProps<typeof  userItemVariants>["variant"];
}
export const UserItem = ({
  id,
  label = "Member",
  image,
  variant
}: Props) => {
  const workspaceId = useWorkspaceId();
  const icon = label.charAt(0).toUpperCase();
  return ( 
    <Button
      variant={"transparent"}
      size={"sm"}
      className={cn(userItemVariants({ variant }))}
      asChild
    >
      <Link href={`/workspace/${workspaceId}/member/${id}`}>
        <Avatar className="size-5 rounded-md mr-1">
          <AvatarImage src={image} className="rounded-md"/>
          <AvatarFallback className="rounded-md bg-sky-500 text-white text-sm">
            {icon}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm truncate">
          {label}
        </span>
      </Link>
    </Button>
  );
}