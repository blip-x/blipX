import { format } from "date-fns";
interface ChannelHeroProps {
  name: string;
  creationTime: number;
}
export const ChannelHero = ({ name, creationTime }: ChannelHeroProps) => {
  return (
    <div className="mt-[88px] mx-5 mb-4">
      <p className="font-bold text-2xl flex items-center mb-2">
        # { name }
      </p>
      <p className="text-slate-800 font-normal mb-4">
        This channel was created on {format(creationTime, "MMMM do, yyyy")}. This is the very beggining of the <strong>{ name }</strong> channel.
      </p>
    </div>
  )
}