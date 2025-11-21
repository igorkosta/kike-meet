import React from "react";
import ShareMeetingButton from "./ShareMeetingButton";
import FeedbackButton from "./FeedbackButton";

export default function Header({ myId, setShowFeedbackOverlay }) {

  return (
    <header className="p-4 bg-neutral-800 flex justify-between items-center">
      <div className="flex items-center space-x-3 mb-2 sm:mb-0">

        <img src="/icon-192.png" alt="KiKé Buzz" className="w-10 h-10 mr-2 object-contain" />
        <div className="flex flex-col leading-tight">
          <h3>Buzz (Alpha)</h3>
            <span className="ray-800 py-1 rounded-md text-sm text-neutral-400">
              Your ID: <span className="font-mono">{myId || "Connecting..."}</span>
            </span>
        </div>
      </div>
      <div className="flex gap-2">
        <FeedbackButton setShowFeedbackOverlay={setShowFeedbackOverlay}/>
        <ShareMeetingButton meetingId={myId} />
      </div>
    </header>
  )
}
