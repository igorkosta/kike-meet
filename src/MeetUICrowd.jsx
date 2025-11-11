import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { v4 as uuidv4 } from "uuid";

export default function MeetUI() {
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState("");
  const [peers, setPeers] = useState({}); // { peerId: MediaStream }
  const [messages, setMessages] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [autoJoin, setAutoJoin] = useState(null);

  // Initialize PeerJS
  useEffect(() => {
    const newPeer = new Peer(uuidv4().slice(0, 8));
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      setMyId(id);
      addMessage(`Your ID: ${id}`);
      const params = new URLSearchParams(window.location.search);
      const room = params.get("room");
      if (room) {
        addMessage(`Auto-joining room: ${room}`);
        setAutoJoin(room);
        setRoomId(room);
      }
    });

    newPeer.on("call", (call) => {
      addMessage(`Incoming call from ${call.peer}`);
      ensureLocalStream().then((stream) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          addPeerStream(call.peer, remoteStream);
        });
      });
    });

    return () => {
      newPeer.destroy();
      Object.values(peers).forEach((stream) =>
        stream.getTracks().forEach((t) => t.stop())
      );
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Automatically join after camera start
  useEffect(() => {
    if (peer && localStream && autoJoin) {
      addMessage(`Joining existing participants in room: ${autoJoin}`);
      connectToRoom(autoJoin);
    }
  }, [localStream]);

  async function ensureLocalStream() {
    if (localStream) return localStream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      addPeerStream("me", stream);
      return stream;
    } catch (err) {
      alert("Cannot access camera/mic: " + err.message);
    }
  }

  async function startCamera() {
    await ensureLocalStream();
  }

  function addPeerStream(id, stream) {
    setPeers((prev) => ({ ...prev, [id]: stream }));
  }

  function connectToRoom(room) {
    // In a real app you’d fetch peer IDs for the room from a server.
    // Here we just use manual invites: ?room=<roomID>
    addMessage("Connected to room (demo mode)");
  }

  function copyRoomLink() {
    const room = roomId || uuidv4().slice(0, 6);
    const url = `${window.location.origin}?room=${room}`;
    navigator.clipboard.writeText(url);
    setRoomId(room);
    addMessage(`Room link copied: ${url}`);
    alert(`Invite link copied:\n${url}`);
  }

  function addMessage(msg) {
    setMessages((prev) => [...prev, { id: Date.now(), text: msg }]);
  }

  return (
    <div
      id="meet-container"
      className="w-full h-full flex flex-col bg-neutral-900 text-neutral-100"
    >
      <header className="flex justify-between items-center bg-neutral-800 p-3">
        <div>
          <h1 className="text-lg font-bold">Meet Clone (Multi-user)</h1>
          <p className="text-sm text-neutral-400 font-mono">
            {myId ? `Your ID: ${myId}` : "Connecting..."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startCamera}
            className="bg-emerald-600 px-3 py-1 rounded"
          >
            Start Camera
          </button>
          <button
            onClick={copyRoomLink}
            className="bg-sky-600 px-3 py-1 rounded"
          >
            Copy Room Link
          </button>
        </div>
      </header>

      {/* Video Grid */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div
          className={`grid w-full h-full gap-4 ${
            Object.keys(peers).length <= 1
              ? "grid-cols-1"
              : Object.keys(peers).length <= 4
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {Object.entries(peers).map(([id, stream]) => (
            <VideoTile key={id} id={id} stream={stream} />
          ))}
        </div>
      </main>

      {/* Logs */}
      <footer className="bg-neutral-800/50 p-3 text-xs overflow-auto h-32">
        {messages.map((m) => (
          <div key={m.id}>{m.text}</div>
        ))}
      </footer>
    </div>
  );
}

function VideoTile({ id, stream }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={id === "me"}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
        {id === "me" ? "You" : id}
      </div>
    </div>
  );
}
