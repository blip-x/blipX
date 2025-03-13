"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../api/use-current-user";
import { Loader, LogOut } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { redirect } from "next/navigation";

type Props = {
 
}
export const UserButton = ({}: Props) => {
  const { data, isLoading } = useCurrentUser();
  const { signOut } = useAuthActions()

  if(isLoading) {
    return <Loader className="size-4 animate-spin text-muted-foreground"/>
  }
  if(!data) {
    return null;
  }
  const { name, image } = data;
  const fallBackIcon = name!.charAt(0).toUpperCase()
  return ( 
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="rounded-md size-10 hover:opacity-75 transition">
          <AvatarImage alt={name} src={image} className="rounded-md"/>
          <AvatarFallback className="bg-sky-500 text-white rounded-md">
            {fallBackIcon}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="right" className="w-60">
        <DropdownMenuItem
          onClick={() => {
            signOut()
            redirect("/auth")
          }}
          className="cursor-pointer"
        >
          <LogOut className="size-4 mr-2"/>
          {"Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}