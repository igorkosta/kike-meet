import React from "react";
import { Share2 } from "lucide-react";
import useIsMobile from "../hooks/useIsMobile";

export default function ShareMeetingButton({ meetingId }) {
  const isMobile = useIsMobile();
  const url = `${window.location.origin + window.location.pathname}?id=${meetingId}`;


  function shareMeeting({
    title = "Join my video call!",
    text = "Click the link below to join my meeting"
  }) {
    const meetingUrl = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title,
          text,
          url,
        })
        .then(() => console.log("Meeting shared successfully"))
        .catch((err) => console.error("Error sharing:", err));
    } else {
      // Fallback for desktop or unsupported browsers
      navigator.clipboard.writeText(meetingUrl);
      console.log("Meeting link copied to clipboard!");
    }
  }

  return (
    <div className="text-xs">
      <button
        onClick={shareMeeting}
        className="text-sm flex items-center gap-2 bg-neutral-700 text-white px-4 py-2 rounded-full hover:bg-grey-700"
      >
        <Share2 size={18} />
        { isMobile ? '' : 'Share Meeting' }
      </button>
    </div>
  )
}
