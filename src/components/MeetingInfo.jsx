import React from  "react";
import { useTranslation } from "react-i18next";
import { Copy } from "lucide-react";

export default function MeetingInfo({ closeWindow, meetingId }) {
  const { t } = useTranslation();
  const meetingUrl = `${window.location.origin + window.location.pathname}?id=${meetingId}`;

  async function copyMeetingLink() {
    navigator.clipboard.writeText(meetingUrl);
  }

  return (
    <div className="absolute w-fit bottom-20 left-4 bg-neutral-800/80 backdrop-blur-md
                    rounded-xl p-4 flex flex-col gap-2 text-sm shadow-lg w-72
                    border border-neutral-700 z-20">
      <div className="flex justify-between items-start">
        <h3 className="text-base text-neutral-200">
          {t("meetingInfoBox.title")}
        </h3>
        <button
          onClick={closeWindow}
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 bg-neutral-900/60 rounded-lg px-3 py-2">
        <span
          className="truncate text-grey-400 text-xs"
        >
          {meetingUrl}
        </span>
        <button
          onClick={copyMeetingLink}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs"
        >
          <Copy size={14} />
        </button>
      </div>

      <p className="text-[11px] text-neutral-400 leading-tight">
        {t("meetingInfoBox.description")}
      </p>
    </div>
)}
