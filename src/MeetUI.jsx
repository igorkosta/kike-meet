import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { v4 as uuidv4 } from "uuid";
import { Mic, MicOff, Video, VideoOff, Info } from "lucide-react";
import useIsMobile from "./hooks/useIsMobile";
import MeetingInfo from "./components/MeetingInfo";

export default function MeetUI() {
  const isMobile = useIsMobile();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState("");
  const [remoteId, setRemoteId] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [autoJoinTarget, setAutoJoinTarget] = useState(null);
  const [interactionReady, setInteractionReady] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [showMeetingInfo, setShowMeetingInfo] = useState(true);


  // Start local camera
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });
  }, []);

  // Create PeerJS instance
  useEffect(() => {
    const newPeer = new Peer(uuidv4().slice(0, 8));
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      setMyId(id);
      addMessage(`Your PeerJS ID: ${id}`);

      const params = new URLSearchParams(window.location.search);
      const remote = params.get("id");
      if (remote) {
        addMessage(`Meeting link detected → ${remote}`);
        setRemoteId(remote);
        setAutoJoinTarget(remote);
      }
    });

    newPeer.on("call", (call) => {
      addMessage(`Incoming call from ${call.peer}`);
      ensureLocalStream().then((stream) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = remoteStream;
          setConnected(true);
          addMessage(`Connected with ${call.peer}`);
        });
      });
    });

    return () => {
      newPeer.destroy();
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Listen for first click/tap → safe to start media
  useEffect(() => {
    function handleFirstInteraction() {
      setInteractionReady(true);
    }
    window.addEventListener("click", handleFirstInteraction, { once: true });
    return () =>
      window.removeEventListener("click", handleFirstInteraction, { once: true });
  }, []);

  useEffect(() => {
    // Auto-start only if this is a join link and user has interacted
    if (interactionReady && autoJoinTarget && !connected) {
      addMessage("User interacted — starting camera and joining...");
      startLocalStream(true);
    }
  }, [interactionReady]);

  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current)
      localVideoRef.current.srcObject = localStreamRef.current;
  }, [isMobile]);

  async function ensureLocalStream() {
    if (localStream) return localStream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      addMessage("Camera ready.");
      return stream;
    } catch (err) {
      alert("Camera/mic access denied or unavailable: " + err.message);
      throw err;
    }
  }

  async function startLocalStream(autoJoin = false) {
    const stream = await ensureLocalStream();
    if (autoJoin && peer && autoJoinTarget && !connected) {
      addMessage(`Calling ${autoJoinTarget}...`);
      startCall(autoJoinTarget, stream);
    }
  }

  function startCall(targetId, stream) {
    if (!targetId) return alert("No remote ID found");
    const call = peer.call(targetId, stream);
    call.on("stream", (remoteStream) => {
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = remoteStream;
      setConnected(true);
      addMessage(`Connected with ${targetId}`);
    });
    call.on("close", () => {
      setConnected(false);
      addMessage("Call ended");
    });
    call.on("error", (err) => addMessage("Call error: " + err.message));
  }

  function addMessage(msg) {
    setMessages((prev) => [...prev, { id: Date.now(), text: msg }]);
  }


    // 🎤 Toggle mic
  function toggleMic() {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  }

  // 🎥 Toggle camera
  function toggleCam() {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamEnabled(videoTrack.enabled);
    }
  }

  return (
    <div className="w-screen h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      <header className="p-4 bg-neutral-800 flex justify-between items-center">
        <div>
          <h3>KiKé Meet (Alpha)</h3>
          <div className="text-sm text-neutral-400">
            Your ID: <span className="font-mono">{myId || "Connecting..."}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => startLocalStream(autoJoinTarget ? true : false)}
            className="bg-blue-600 px-3 mx-8 py-1 rounded"
          >
            {autoJoinTarget ? "Join Call" : "Start Camera"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-stretch justify-center bg-neutral-900 p-4">
        {/* Video area */}
        <div className="flex flex-1 flex-col md:flex-row items-center justify-center gap-4 mb-4">

          { isMobile ? (
            <div className="sm:hidden w-full h-full relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {/* small self-view */}
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute top-4 right-4 w-24 h-32 rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="flex w-full h-full">
              <div className="relative w-1/2 h-full">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-xl" />
                {/* 🏷️ Local participant name */}
                <div className="absolute top-3 left-3 bg-black/60 px-3 py-1 text-sm rounded-md">You</div>
              </div>
              <div className="relative w-1/2 h-full">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover rounded-xl" />
                {/* 🏷️ Remote participant name */}
                <div className="absolute top-3 left-3 bg-black/60 px-3 py-1 text-sm rounded-md">Guest</div>
              </div>
            </div>
          )}

        </div>

        {messages.map((m) => (
          console.log(`events log: ${m.text}`)
        ))}

      </main>

      {showMeetingInfo && (
        <MeetingInfo
          meetingId={myId}
          closeWindow={() => setShowMeetingInfo(false)}
        />
      )}

      {/* FOOTER TOOLBAR */}
      <footer
        className="fixed bottom-0 left-0 w-full z-20 bg-neutral-800/95 backdrop-blur-md
                   flex items-center justify-center gap-6 py-3
                   border-t border-neutral-700
                   safe-area-inset-bottom"
      >
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${
            micEnabled ? "bg-neutral-700" : "bg-red-600"
          }`}
        >
          {micEnabled ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        <button
          onClick={toggleCam}
          className={`p-3 rounded-full ${
            camEnabled ? "bg-neutral-700" : "bg-red-600"
          }`}
        >
          {camEnabled ? <Video size={22} /> : <VideoOff size={22} />}
        </button>

        <button
          onClick={() => setShowMeetingInfo((v) => !v)}
          className="p-3 rounded-full bg-neutral-700 hover:bg-neutral-600
                     flex items-center justify-center transition-colors duration-150"
          title="Meeting info"
        >
          <Info size={20} className="text-neutral-100" />
        </button>
      </footer>
    </div>
  );
}
