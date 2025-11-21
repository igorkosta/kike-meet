import React from "react";
// import html2canvas from "html2canvas-pro";
import { MessageSquareText } from "lucide-react";
import useIsMobile from "../hooks/useIsMobile";

export default function ShareMeetingButton({ setShowFeedbackOverlay }) {
  const isMobile = useIsMobile();
  // function screenshot() {
  //   const screenshotTarget = document.body;

  //   html2canvas(screenshotTarget).then((canvas) => {
  //     const screenshot = canvas.toDataURL("image/png");
  //     const img = '<img src="'+screenshot+'">';
  //     const popup = window.open();
  //     popup.document.write(img);
  //     // popup.print();
  //     // window.location.href = base64image;
  //   });
  // }

  return (
    <div className="text-xs">
      <button
        onClick={() => setShowFeedbackOverlay(true)}
        className="text-sm flex items-center gap-2 bg-neutral-700 text-white px-4 py-2 rounded-full hover:bg-grey-700"
      >
        <MessageSquareText size={18} />
        { isMobile ? '' : 'Feedback' }
      </button>
    </div>
  )
}
