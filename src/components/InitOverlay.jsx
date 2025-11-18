import React from 'react';
import { PhoneCall } from 'lucide-react';

export default function InitOverlay({ handleFirstInteraction }) {
  // const searchParams = new URLSearchParams(window.location.search);
  // const joiningId = searchParams.get("id");
  // const isJoining = Boolean(joiningId);

  // const [showOverlay, setShowOverlay] = useState(isJoining);

  // const handleUserInteraction = async () => {
  //  setShowOverlay(false);

    // const stream = await startStreamSafe();

    // if (!stream) {
    //   alert("We need camera/microphone access to join the call.");
    //   return;
    // }

    // // If you automatically call the peer after the stream starts:
    // if (isJoining && peer && joiningId) {
    //   callPeer(joiningId);
    // }
  // };

  return (
    <div
      onClick={handleFirstInteraction}
      className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center text-white text-center p-6"
    >
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Tap to Join the Meeting</h1>
        <p className="opacity-80">
          We need your permission to start the camera and microphone.
        </p>
        <button className="bg-green-600 px-6 py-3 rounded-full text-white shadow-md">
          <PhoneCall size={50} className="animate-wiggle"/>
        </button>
      </div>
    </div>
)}
