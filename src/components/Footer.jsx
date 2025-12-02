import React from "react";
import { Mic, MicOff, Video, VideoOff, Info, PhoneOff } from "lucide-react";
import ShareMeetingButton from "./ShareMeetingButton";
import useIsMobile from "../hooks/useIsMobile";

export default function Footer({ toggleMic, toggleCam, endCall, micEnabled, camEnabled, setShowMeetingInfo }) {
  const isMobile = useIsMobile();

  return (
    <footer
      className={isMobile ? `md:hidden
        fixed bottom-0 left-0 right-0
        flex items-center justify-center gap-6
        px-6 py-4
        backdrop-blur-xs bg-white/20
        text-white` : `hidden md:flex
        absolute bottom-0 left-0 right-0
        p-5 items-center justify-center
        backdrop-blur-xs bg-white/20
        text-white gap-6`}

    >
      <button
        onClick={toggleMic}
        className={`p-3 rounded-full bg-black-600 ${
          micEnabled ? "bg-neutral-800" : "bg-red-600"
        }`}
        title="Toggle Microphone"
      >
        {micEnabled ? <Mic size={22} /> : <MicOff size={22} />}
      </button>

      <button
        onClick={toggleCam}
        className={`p-3 rounded-full ${
          camEnabled ? "bg-neutral-800" : "bg-red-600"
        }`}
        title="Toggle Camera"
      >
        {camEnabled ? <Video size={22} /> : <VideoOff size={22} />}
      </button>

      <button
        onClick={endCall}
        className="bg-red-600 p-3 rounded-full"
        title="End Call"
      >
        <PhoneOff size={22} />
      </button>

      {isMobile ? (
        <ShareMeetingButton />
      ) : (
        <button
          onClick={() => setShowMeetingInfo((v) => !v)}
          className="p-3 rounded-full bg-neutral-800"
          title="Meeting info"
        >
          <Info size={22} />
        </button>
      )}

    </footer>
  );
}
