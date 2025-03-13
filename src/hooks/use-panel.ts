import { useParentMessageId } from "@/features/message/store/use-parent-message-id"
import { useProfileMemberId } from "@/features/member/store/use-profile-member-id";

export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useParentMessageId();
  const [profileMemberId, setProfileMemberId] = useProfileMemberId();
  function onOpenProfile(memberId: string) {
    setProfileMemberId(memberId);
    setParentMessageId(null);
  }
  function onOpenMessage(messageId: string) {
    setParentMessageId(messageId);
    setProfileMemberId(null);
  }
  function onClose() {
    setParentMessageId(null);
    setProfileMemberId(null);
  }

  return {
    parentMessageId,
    profileMemberId,
    onOpenProfile,
    onOpenMessage,
    onClose
  }
}