import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { IconType } from "react-icons/lib";
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from "@/lib/utils";
interface Props {
  label: string;
  id: string;
  icon: LucideIcon | IconType;
  variant?: VariantProps<typeof SidebarItemVariants>["variant"];
}

const SidebarItemVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-[18px] text-sm overflow-hidden",
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
export const SidebarItem = ({
  label,
  id,
  icon: Icon,
  variant
}: Props) => {
  const workspaceId = useWorkspaceId();
  return (
    <Button
      variant={"transparent"}
      size={"sm"}
      className={cn(SidebarItemVariants({variant}))}
      asChild
    >
      <Link href={`/workspace/${workspaceId}/channel/${id}`}>
        <Icon className="size-3.5 shrink-0 mr-1"/>
        <span className="text-sm truncate">
          {label}
        </span>
      </Link>
    </Button>
  );
}