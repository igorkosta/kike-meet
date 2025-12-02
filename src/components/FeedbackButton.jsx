import React from "react";
import { MessageSquareText } from "lucide-react";
import { useTranslation } from "react-i18next";
import useIsMobile from "../hooks/useIsMobile";

export default function ShareMeetingButton({ setShowFeedbackOverlay }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <div className="text-xs">
      <button
        onClick={() => setShowFeedbackOverlay(true)}
        className="text-sm flex items-center gap-2 bg-neutral-800 text-white px-4 py-2 rounded-full hover:bg-grey-700"
      >
        <MessageSquareText size={18} />
        { isMobile ? '' : t('header.feedbackButton') }
      </button>
    </div>
  )
}
