import React from "react";
import { Mic, MicOff, Video, VideoOff, Info, PhoneOff } from "lucide-react";

export default function Footer({ toggleMic, toggleCam, endCall, micEnabled, camEnabled, setShowMeetingInfo }) {
  return (
    <footer
      className="fixed bottom-0 left-0 w-full z-20 bg-neutral-800/95 backdrop-blur-md
                 flex items-center justify-center gap-6 py-3
                 border-t border-neutral-700
                 safe-area-inset-bottom"
    >
      <button
        onClick={toggleMic}
        className={`p-3 rounded-full bg-black-600 ${
          micEnabled ? "bg-neutral-700" : "bg-red-600"
        }`}
        title="Toggle Microphone"
      >
        {micEnabled ? <Mic size={22} /> : <MicOff size={22} />}
      </button>

      <button
        onClick={toggleCam}
        className={`p-3 rounded-full ${
          camEnabled ? "bg-neutral-700" : "bg-red-600"
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

      <button
        onClick={() => setShowMeetingInfo((v) => !v)}
        className="p-3 rounded-full bg-neutral-700"
        title="Meeting info"
      >
        <Info size={20} />
      </button>
    </footer>
  );
}
