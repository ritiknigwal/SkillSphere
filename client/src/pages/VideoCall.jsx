import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../api/axios";

const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://skillsphere-1k44.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

function VideoCall() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryUserId = searchParams.get("userId");
  const incomingFromChat = searchParams.get("incoming") === "true";
  const callerIdFromChat = searchParams.get("callerId");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState("Idle");
  const [isCalling, setIsCalling] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteCameraOn, setRemoteCameraOn] = useState(true);
  const [callSeconds, setCallSeconds] = useState(0);
  const [permissionError, setPermissionError] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const targetUserRef = useRef(null);
  const autoCallStartedRef = useRef(false);
  const autoIncomingAcceptedRef = useRef(false);

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("fullName") || "SkillSphere User";

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const formatTimer = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/user/all");
      const allUsers = res.data.users || [];

      setUsers(allUsers);

      if (queryUserId && !autoCallStartedRef.current) {
        const userFromQuery = allUsers.find((user) => user._id === queryUserId);

        if (userFromQuery) {
          setSelectedUser(userFromQuery);
          autoCallStartedRef.current = true;

          setTimeout(() => {
            startCall(userFromQuery);
          }, 600);
        }
      }

      if (
        incomingFromChat &&
        callerIdFromChat &&
        !autoIncomingAcceptedRef.current
      ) {
        const storedCall = sessionStorage.getItem("incomingVideoCall");

        if (storedCall) {
          const parsedCall = JSON.parse(storedCall);

          if (parsedCall?.callerId === callerIdFromChat) {
            autoIncomingAcceptedRef.current = true;
            sessionStorage.removeItem("incomingVideoCall");

            setTimeout(() => {
              acceptCallWithData(parsedCall);
            }, 600);
          }
        } else {
          setCallStatus("Incoming call data missing. Please try again.");
        }
      }
    } catch (err) {
      console.log("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();

    if (userId) {
      socket.emit("join_room", userId);
    }

    socket.on("video_incoming_call", handleIncomingCall);
    socket.on("video_call_answered", handleCallAnswered);
    socket.on("video_call_rejected", handleCallRejected);
    socket.on("video_call_ended", handleCallEnded);
    socket.on("video_ice_candidate", handleIceCandidate);
    socket.on("video_remote_camera_toggle", (data) =>
      setRemoteCameraOn(data.isCameraOn)
    );
    socket.on("video_remote_mic_toggle", (data) =>
      setRemoteMicOn(data.isMicOn)
    );
    socket.on("video_remote_screen_share_started", () =>
      setCallStatus("Remote user is sharing screen")
    );
    socket.on("video_remote_screen_share_stopped", () =>
      setCallStatus("Screen sharing stopped")
    );

    return () => {
      socket.off("video_incoming_call", handleIncomingCall);
      socket.off("video_call_answered", handleCallAnswered);
      socket.off("video_call_rejected", handleCallRejected);
      socket.off("video_call_ended", handleCallEnded);
      socket.off("video_ice_candidate", handleIceCandidate);
      socket.off("video_remote_camera_toggle");
      socket.off("video_remote_mic_toggle");
      socket.off("video_remote_screen_share_started");
      socket.off("video_remote_screen_share_stopped");

      cleanupCall(false);
    };
  }, []);

  useEffect(() => {
    if (inCall) {
      callTimerRef.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(callTimerRef.current);
  }, [inCall]);

  const createPeerConnection = (targetUserId) => {
    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("video_ice_candidate", {
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      setCallStatus(pc.connectionState);

      if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected" ||
        pc.connectionState === "closed"
      ) {
        setCallStatus("Call disconnected");
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const getLocalStream = async () => {
    try {
      setPermissionError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.log("Camera/Mic permission error:", err);
      setPermissionError("Camera or microphone permission required.");
      throw err;
    }
  };

  const startCall = async (user) => {
    try {
      if (!user?._id) return;
      if (inCall || isCalling || peerConnectionRef.current) return;

      setSelectedUser(user);
      targetUserRef.current = user._id;
      setIsCalling(true);
      setCallStatus("Calling...");

      const stream = await getLocalStream();
      const pc = createPeerConnection(user._id);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("video_call_user", {
        callerId: userId,
        callerName: userName,
        receiverId: user._id,
        offer,
      });
    } catch (err) {
      alert("Camera/Mic permission required");
      cleanupCall();
    }
  };

  const handleIncomingCall = (data) => {
    if (inCall || isCalling || peerConnectionRef.current) {
      socket.emit("video_reject_call", {
        callerId: data.callerId,
        receiverId: userId,
      });
      return;
    }

    setIncomingCall(data);
    setCallStatus("Incoming call...");
  };

  const acceptCallWithData = async (callData) => {
    try {
      if (!callData) return;

      targetUserRef.current = callData.callerId;

      setSelectedUser({
        _id: callData.callerId,
        fullName: callData.callerName || "Caller",
      });

      const stream = await getLocalStream();
      const pc = createPeerConnection(callData.callerId);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("video_answer_call", {
        callerId: callData.callerId,
        receiverId: userId,
        answer,
      });

      setIncomingCall(null);
      setInCall(true);
      setIsCalling(false);
      setCallStatus("Connected");
      setCallSeconds(0);
    } catch (err) {
      console.log("Accept call failed", err);
      alert("Failed to accept call. Check camera/mic permission.");
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    await acceptCallWithData(incomingCall);
  };

  const rejectCall = () => {
    if (!incomingCall) return;

    socket.emit("video_reject_call", {
      callerId: incomingCall.callerId,
      receiverId: userId,
    });

    setIncomingCall(null);
    setCallStatus("Call rejected");
  };

  const handleCallAnswered = async (data) => {
    try {
      if (!peerConnectionRef.current) return;

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );

      setIsCalling(false);
      setInCall(true);
      setCallStatus("Connected");
      setCallSeconds(0);
    } catch (err) {
      console.log("Answer handling failed", err);
    }
  };

  const handleCallRejected = () => {
    alert("Call rejected or user is busy");
    cleanupCall();
  };

  const handleCallEnded = () => {
    alert("Call ended");
    cleanupCall();
  };

  const handleIceCandidate = async (data) => {
    try {
      if (peerConnectionRef.current && data.candidate) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      }
    } catch (err) {
      console.log("ICE candidate error", err);
    }
  };

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);

      socket.emit("video_toggle_mic", {
        targetUserId: targetUserRef.current,
        isMicOn: audioTrack.enabled,
      });
    }
  };

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);

      socket.emit("video_toggle_camera", {
        targetUserId: targetUserRef.current,
        isCameraOn: videoTrack.enabled,
      });
    }
  };

  const startScreenShare = async () => {
    try {
      if (!inCall) return;

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      screenStreamRef.current = screenStream;

      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current
        ?.getSenders()
        .find((s) => s.track?.kind === "video");

      if (sender) {
        sender.replaceTrack(screenTrack);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      setIsScreenSharing(true);

      socket.emit("video_screen_share_started", {
        targetUserId: targetUserRef.current,
      });

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.log("Screen share failed", err);
    }
  };

  const stopScreenShare = () => {
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    const sender = peerConnectionRef.current
      ?.getSenders()
      .find((s) => s.track?.kind === "video");

    if (sender && cameraTrack) {
      sender.replaceTrack(cameraTrack);
    }

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;

    setIsScreenSharing(false);

    socket.emit("video_screen_share_stopped", {
      targetUserId: targetUserRef.current,
    });
  };

  const endCall = () => {
    if (targetUserRef.current) {
      socket.emit("video_end_call", {
        targetUserId: targetUserRef.current,
        endedBy: userId,
      });
    }

    cleanupCall();
  };

  const cleanupCall = (resetSelectedUser = true) => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    clearInterval(callTimerRef.current);

    setIncomingCall(null);
    setIsCalling(false);
    setInCall(false);
    setIsMicOn(true);
    setIsCameraOn(true);
    setIsScreenSharing(false);
    setRemoteMicOn(true);
    setRemoteCameraOn(true);
    setCallSeconds(0);
    setCallStatus("Idle");

    targetUserRef.current = null;

    if (resetSelectedUser && !queryUserId) {
      setSelectedUser(null);
    }
  };

  const openFullscreen = () => {
    const container = document.getElementById("video-call-container");

    if (container?.requestFullscreen) {
      container.requestFullscreen();
    }
  };

  const goBackToChat = () => {
    if (targetUserRef.current || selectedUser?._id) {
      navigate("/chat");
      return;
    }

    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div
        id="video-call-container"
        className="max-w-6xl mx-auto bg-slate-800 p-5 rounded"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">SkillSphere Video Call</h2>

          <button
            onClick={goBackToChat}
            className="bg-slate-700 px-3 py-2 rounded text-sm"
          >
            Back to Chat
          </button>
        </div>

        {permissionError && (
          <div className="bg-red-900/40 border border-red-500 p-3 rounded mb-4">
            {permissionError}
          </div>
        )}

        {queryUserId && selectedUser && !inCall && !isCalling && (
          <div className="bg-blue-900/40 border border-blue-500 p-3 rounded mb-4">
            Ready to call:{" "}
            <span className="font-bold">{selectedUser.fullName}</span>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-700 p-4 rounded">
            <h3 className="font-bold mb-3">Users</h3>

            {users.map((user) => (
              <div
                key={user._id}
                className={`p-3 rounded mb-2 flex justify-between items-center ${
                  selectedUser?._id === user._id
                    ? "bg-green-900"
                    : "bg-slate-800"
                }`}
              >
                <span>{user.fullName}</span>

                <button
                  onClick={() => startCall(user)}
                  disabled={inCall || isCalling}
                  className="bg-green-600 px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  {selectedUser?._id === user._id && isCalling
                    ? "Calling..."
                    : "Call"}
                </button>
              </div>
            ))}
          </div>

          <div className="md:col-span-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-black rounded overflow-hidden relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-64 object-cover"
                />

                <p className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs">
                  You {!isMicOn && "🔇"} {!isCameraOn && "📷 Off"}
                </p>
              </div>

              <div className="bg-black rounded overflow-hidden relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />

                <p className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs">
                  Remote {!remoteMicOn && "🔇"} {!remoteCameraOn && "📷 Off"}
                </p>
              </div>
            </div>

            <div className="bg-slate-700 mt-4 p-4 rounded">
              <p>Status: {callStatus}</p>
              <p>Timer: {formatTimer(callSeconds)}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={toggleMic}
                  disabled={!inCall}
                  className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
                >
                  {isMicOn ? "Mute Mic" : "Unmute Mic"}
                </button>

                <button
                  onClick={toggleCamera}
                  disabled={!inCall}
                  className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
                >
                  {isCameraOn ? "Camera Off" : "Camera On"}
                </button>

                {!isScreenSharing ? (
                  <button
                    onClick={startScreenShare}
                    disabled={!inCall}
                    className="bg-purple-600 px-4 py-2 rounded disabled:opacity-50"
                  >
                    Share Screen
                  </button>
                ) : (
                  <button
                    onClick={stopScreenShare}
                    disabled={!inCall}
                    className="bg-purple-700 px-4 py-2 rounded disabled:opacity-50"
                  >
                    Stop Share
                  </button>
                )}

                <button
                  onClick={openFullscreen}
                  className="bg-slate-600 px-4 py-2 rounded"
                >
                  Fullscreen
                </button>

                <button
                  onClick={endCall}
                  disabled={!inCall && !isCalling}
                  className="bg-red-600 px-4 py-2 rounded disabled:opacity-50"
                >
                  End Call
                </button>
              </div>
            </div>
          </div>
        </div>

        {incomingCall && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded text-center">
              <h3 className="text-xl font-bold mb-3">Incoming Call</h3>
              <p className="mb-4">{incomingCall.callerName} is calling you</p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={acceptCall}
                  className="bg-green-600 px-4 py-2 rounded"
                >
                  Accept
                </button>

                <button
                  onClick={rejectCall}
                  className="bg-red-600 px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {isCalling && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
            <div className="bg-slate-800 p-6 rounded text-center">
              <h3 className="text-xl font-bold mb-3">Calling...</h3>
              <p className="mb-4">{selectedUser?.fullName}</p>

              <button
                onClick={endCall}
                className="bg-red-600 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoCall;