import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { v4 as uuidv4 } from "uuid";

export default function MeetUI() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState("");
  const [remoteId, setRemoteId] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [autoJoinTarget, setAutoJoinTarget] = useState(null);
  const [interactionReady, setInteractionReady] = useState(false);

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
        addMessage(`Invite link detected → ${remote}`);
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

  function copyInviteLink() {
    const url = `${window.location.origin + window.location.pathname}?id=${myId}`;
    navigator.clipboard.writeText(url);
    addMessage("Copied invite link: " + url);
    alert("Invite link copied!\nSend it to the person you want to invite.\n" + url);
  }

  return (
    <div className="w-screen h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      <header className="p-4 bg-neutral-800 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">KiKé Meet (Alpha)</h1>
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
          <button
            onClick={copyInviteLink}
            disabled={!myId}
            className="bg-sky-600 px-3 py-1 rounded"
          >
            Copy Invite Link
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-stretch justify-center bg-neutral-900 p-4">
        {/* Video area */}
        <div className="flex flex-1 flex-col md:flex-row items-center justify-center gap-4 mb-4">
          {/* Local video */}
          <div className="relative flex-1 max-w-[50%] bg-black rounded-xl overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 text-xs bg-black/70 px-2 py-1 rounded">
              You
            </div>
          </div>

          {/* Remote video */}
          <div className="relative flex-1 max-w-[50%] bg-black rounded-xl overflow-hidden aspect-video">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 text-xs bg-black/70 px-2 py-1 rounded">
              {connected ? "Remote" : ""}
            </div>
          </div>
        </div>

        {messages.map((m) => (
          console.log(`events log: ${m.text}`)
        ))}

      </main>

    </div>
  );
}
