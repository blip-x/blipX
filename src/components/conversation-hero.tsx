import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
interface ChannelHeroProps {
  name?: string;
  memberImage?: string;
}
export const ConversationHero = ({ name = "Member", memberImage }: ChannelHeroProps) => {
  const avatarFallback = name.charAt(0).toUpperCase();
  return (
    <div className="mt-[88px] mx-5 mb-4">
      <div className="flex items-center gap-x-1 mb-2">
        <Avatar className="size-14 mr-2">
          <AvatarImage src={memberImage} />
          <AvatarFallback>
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <p className="font-bold text-2xl">
          { name }
        </p>
      </div>
      <p className="text-slate-800 font-normal mb-4">
        This conversation is just between you and <strong>{name}</strong>
      </p>
    </div>
  )
}