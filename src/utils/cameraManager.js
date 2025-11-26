export class CameraManager {
  constructor({
    localStreamRef,
    localVideoRef,
    currentCallRef,
    onCameraStateChange
  }) {
    this.localStreamRef = localStreamRef;
    this.localVideoRef = localVideoRef;
    this.currentCallRef = currentCallRef;
    this.onCameraStateChange = onCameraStateChange;

    // Bind methods so “this” never gets lost
    this.toggleCamera = this.toggleCamera.bind(this);
    this.enableCamera = this.enableCamera.bind(this);
    this.disableCamera = this.disableCamera.bind(this);

    this.cameraEnabled = true;
    // this.localStreamRef = localStreamRef;
    // this.localVideoRef = localVideoRef;
    // this.currentCallRef = currentCallRef;

    // this.cameraEnabled = true;
  }

  isEnabled() {
    return this.cameraEnabled;
  }

  async toggleCamera() {
    if (this.cameraEnabled) {
      this.disableCamera();
    } else {
      await this.enableCamera();
    }
  }

  async disableCamera() {
    console.log("Disabling camera");
    const stream = this.localStreamRef.current;
    console.log("stream", stream);
    // 1. Stop all video tracks
    if (stream) {
      console.log("video tracks", stream.getVideoTracks());
      stream.getVideoTracks().forEach(t => t.stop());
      console.log("stream after disabling", stream);
    }

    // 2. Detach from video element (this kills camera immediately)
    if (this.localVideoRef.current) {
      this.localVideoRef.current.srcObject = null;
    }

    // 3. Stop sending video to remote peer
    const pc = this.currentCallRef.current?.peerConnection;
    if (pc) {
      const videoSender = pc.getSenders().find(s => s.track?.kind === "video");
      if (videoSender) {
        videoSender.replaceTrack(null);  // ← THIS IS WHAT HIDES YOU REMOTELY
      }
    }

    this.cameraEnabled = false;
    this.onCameraStateChange?.(false);   // notify component

    console.log("Camera off");
  }

  async enableCamera() {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      // A) update local video element
      if (this.localVideoRef.current) {
        this.localVideoRef.current.srcObject = newStream;
      }

      // B) merge with existing audio tracks if any
      if (this.localStreamRef.current) {
        const audioTracks = this.localStreamRef.current.getAudioTracks();
        this.localStreamRef.current = new MediaStream([
          ...audioTracks,
          newVideoTrack,
        ]);
      } else {
        this.localStreamRef.current = newStream;
      }

      // C) update PeerJS track sender
      if (this.currentCallRef.current) {
        const sender = this.currentCallRef.current.peerConnection
          .getSenders()
          .find(s => s.track && s.track.kind === "video");

        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }

      this.cameraEnabled = true;
      this.onCameraStateChange?.(true); // notify component

    } catch (err) {
      console.error("Failed to enable camera:", err);
    }
  }
}
