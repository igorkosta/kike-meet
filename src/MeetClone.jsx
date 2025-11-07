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

  // initialize PeerJS
  useEffect(() => {
    const newPeer = new Peer(uuidv4().slice(0, 8), {
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
        ]
      }
    }); // short readable ID

    setPeer(newPeer);

    newPeer.on("open", (id) => {
      setMyId(id);
      addMessage(`Your PeerJS ID: ${id}`);
    });

    newPeer.on("call", (call) => {
      addMessage(`Incoming call from ${call.peer}`);
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
            setConnected(true);
            addMessage(`Connected with ${call.peer}`);
          });
        })
        .catch((err) => addMessage("Failed to access camera: " + err.message));
    });

    return () => {
      newPeer.destroy();
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startLocalStream() {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Browser does not support getUserMedia or insecure context (use https or localhost).");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      addMessage("Camera started.");
    } catch (err) {
      addMessage("Failed to start camera: " + err.message);
    }
  }

  function callRemote() {
    if (!peer) return;
    if (!remoteId) return alert("Enter remote peer ID");
    if (!localStream) return alert("Start your camera first");

    const call = peer.call(remoteId, localStream);
    addMessage(`Calling ${remoteId}...`);

    call.on("stream", (remoteStream) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      setConnected(true);
      addMessage(`Connected with ${remoteId}`);
    });

    call.on("close", () => {
      addMessage("Call ended");
      setConnected(false);
    });

    call.on("error", (err) => addMessage("Call error: " + err.message));
  }

  function addMessage(msg) {
    setMessages((prev) => [...prev, { id: Date.now(), text: msg }]);
  }

  return (
    <div className="w-screen h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      <header className="p-4 bg-neutral-800 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Meet Clone (PeerJS)</h1>
          <div className="text-sm text-neutral-400">
            Your ID: <span className="font-mono">{myId || "Connecting..."}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={startLocalStream} className="bg-emerald-600 px-3 py-1 rounded">
            Start Camera
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-3 gap-4 p-4">
        <section className="col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative bg-black rounded overflow-hidden aspect-video">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <div className="absolute top-1 left-1 text-xs bg-black/70 px-2 py-1 rounded">You</div>
            </div>

            <div className="relative bg-black rounded overflow-hidden aspect-video">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute top-1 left-1 text-xs bg-black/70 px-2 py-1 rounded">
                {connected ? "Remote" : "Waiting..."}
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 p-3 rounded flex flex-col gap-2">
            <input
              value={remoteId}
              onChange={(e) => setRemoteId(e.target.value)}
              placeholder="Enter peer ID to call"
              className="p-2 bg-neutral-900 rounded text-sm"
            />
            <button onClick={callRemote} className="bg-sky-600 px-3 py-1 rounded text-sm">
              Call
            </button>
          </div>
        </section>

        <aside className="bg-neutral-800/50 p-3 rounded flex flex-col gap-2 overflow-auto">
          <h3 className="text-sm font-semibold">Events</h3>
          <div className="text-xs space-y-1 overflow-auto">
            {messages.map((m) => (
              <div key={m.id}>{m.text}</div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
