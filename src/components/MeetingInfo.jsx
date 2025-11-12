import React from  "react";
import { Copy } from "lucide-react";

export default function MeetingInfo({ closeWindow, meetingId }) {
  const meetingUrl = `${window.location.origin + window.location.pathname}?id=${meetingId}`;

  async function copyMeetingLink() {
    navigator.clipboard.writeText(meetingUrl);
  }

  return (
    <div className="absolute bottom-24 left-4 bg-neutral-800/80 backdrop-blur-md
                    rounded-xl p-4 flex flex-col gap-2 text-sm shadow-lg w-72
                    border border-neutral-700 z-20">
      <div className="flex justify-between items-start">
        <h2 className="text-base font-semibold text-neutral-200">
          Your Meeting is Ready
        </h2>
        <button
          onClick={closeWindow}
          className="text-neutral-400 hover:text-neutral-200"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 bg-neutral-900/60 rounded-lg px-3 py-2">
        <a
          href={meetingUrl}
          target="_blank"
          rel="noreferrer"
          className="truncate text-sky-400 hover:underline text-xs"
        >
          {meetingUrl}
        </a>
        <button
          onClick={copyMeetingLink}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs"
        >
          <Copy size={14} />
        </button>
      </div>

      <p className="text-[11px] text-neutral-400 leading-tight">
        Share this link with others to invite them to the meeting.
      </p>
    </div>
)}
