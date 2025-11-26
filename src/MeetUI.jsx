import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { v4 as uuidv4 } from "uuid";
import { MicOff, VideoOff } from "lucide-react";
import useIsMobile from "./hooks/useIsMobile";
import MeetingInfo from "./components/MeetingInfo";
import InitOverlay from "./components/InitOverlay";
import FeedbackOverlay from "./components/FeedbackOverlay";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CameraManager } from "./utils/cameraManager";

export default function MeetUI() {
  const isMobile = useIsMobile();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const currentCallRef = useRef(null);

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
  const [showFeedbackOverlay, setShowFeedbackOverlay] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const joiningId = searchParams.get("id");
  const isJoining = Boolean(joiningId);
  const [showInitOverlay, setShowInitOverlay] = useState(isJoining);


  const cameraManager = useRef(
    new CameraManager({
      localStreamRef,
      localVideoRef,
      currentCallRef,
      onCameraStateChange: (state) => {
        setCamEnabled(state); // <— sync to component
      }
    })
  ).current;

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
  // function handleFirstInteraction() {
  //   console.log("User interaction detected");
  //   setInteractionReady(true);
  //   window.addEventListener("click", handleFirstInteraction, { once: true });
  //   return () =>
  //     window.removeEventListener("click", handleFirstInteraction, { once: true });
  // }

  function firstInteraction() {
    setInteractionReady(true);
    if (autoJoinTarget && !connected) {
      addMessage("User interacted — starting camera and joining...");
      startLocalStream(true);
      setShowInitOverlay(false);
    }
  }
  // useEffect(() => {
  //   // Auto-start only if this is a join link and user has interacted
  //   if (interactionReady && autoJoinTarget && !connected) {
  //     addMessage("User interacted — starting camera and joining...");
  //     startLocalStream(true);
  //   }
  // }, [interactionReady]);

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
      alert("Call ended");
    });
    call.on("error", (err) => addMessage("Call error: " + err.message));
  }

  function addMessage(msg) {
    setMessages((prev) => [...prev, { id: Date.now(), text: msg }]);
  }

    // 🎤 Toggle mic
  function toggleMic() {
    setMicEnabled(prev => !prev);
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  }

  // 🎥 Toggle camera
  const toggleCam = async () => {
    if (camEnabled) {
      // Turn camera OFF
      disableCamera();
    } else {
      // Turn camera ON
      await enableCamera();
    }
  };
  const disableCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.stop();   // ← physically turns the camera OFF
      });
    }

    setCamEnabled(false);
  };

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      const newVideoTrack = stream.getVideoTracks()[0];

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      // if there's an existing local stream, add the new video track to it
      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
          localStreamRef.current = new MediaStream([
            ...audioTracks,
            newVideoTrack
          ]);
      } else {
        localStreamRef.current = stream;
      }

      setCamEnabled(true);
    } catch (err) {
      console.error("Could not enable camera", err);
    }
  };
  // function toggleCam() {
  //   setCamEnabled(prev => !prev);
  //   if (!localStream) return;
  //   const videoTrack = localStream.getVideoTracks()[0];
  //   if (videoTrack) {
  //     videoTrack.enabled = !videoTrack.enabled;
  //     setCamEnabled(videoTrack.enabled);
  //   }
  // }

  const endCall = () => {
    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setConnected(false);
    // alert("Call ended");
    window.opener = self
    window.close()
  };

  return (
    <div className="w-screen h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      {showInitOverlay && (
        <InitOverlay handleFirstInteraction={firstInteraction} />
      )}

      <Header myId={myId} setShowFeedbackOverlay={setShowFeedbackOverlay}/>

      <main className="flex-1 flex flex-col items-stretch justify-center bg-neutral-900 p-4">
        {/* Video area */}
        <div className="flex flex-1 flex-col md:flex-row items-center justify-center gap-4 mb-4">

          { isMobile ? (
            <div className="sm:hidden w-full h-full relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* small self-view */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                className={`absolute top-4 right-4 w-24 h-32 rounded-lg shadow-lg ${!camEnabled ? "opacity-0 border border-neutral-700" : "opacity-100"}`}
              />
            </div>
          ) : (
            <div className="flex w-full h-[calc(100vh-80px)] gap-4">
              <div className="relative w-1/2 h-auto">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover rounded-xl ${!camEnabled ? "opacity-0" : "opacity-100"}`} />
                {/* 🏷️ Local participant name */}
                <div className="z-20 absolute top-3 left-3 bg-black/60 px-3 py-1 text-sm rounded-md">You</div>
                  {!micEnabled && (
                    <div className="z-20 absolute top-2 right-2 bg-black/60 p-1.5 rounded-full">
                      <MicOff className="w-5 h-5 text-white" />
                    </div>
                  )}
                {!camEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                    <VideoOff size={48} />
                  </div>
                )}
              </div>
              <div className="relative w-1/2 h-auto">
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

      <FeedbackOverlay
        show={showFeedbackOverlay}
        setShowFeedbackOverlay={setShowFeedbackOverlay}
        onClose={() => setShowFeedbackOverlay(false)}
      />
      {/* FOOTER TOOLBAR */}
      <Footer
        toggleMic={toggleMic}
        toggleCam={cameraManager.toggleCamera}
        endCall={endCall}
        localStream={localStream}
        micEnabled={micEnabled}
        camEnabled={camEnabled}
        setShowMeetingInfo={setShowMeetingInfo}
      />
    </div>
  );
}
