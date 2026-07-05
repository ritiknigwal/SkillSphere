import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../api/axios";
import UserList from "../components/UserList";

const socket = io("http://localhost:5050", {
  transports: ["websocket"],
});

function Chat() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [file, setFile] = useState(null);
  const [typingUser, setTypingUser] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editMessageId, setEditMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [incomingVideoCall, setIncomingVideoCall] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const userId = localStorage.getItem("userId");

  const reactionEmojis = ["👍", "❤️", "😂", "🔥", "👏"];
  const messageEmojis = ["😀", "😂", "❤️", "👍", "🔥", "👏", "🙏", "😎", "✅", "🎉"];

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Never";
    return date.toLocaleString();
  };

  const openImagePreview = (image) => {
    setPreviewImage(image);
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setPreviewImage("");
    setShowImagePreview(false);
  };

  const startVideoCall = () => {
    if (!selectedUser?._id) return;
    navigate(`/video-call?userId=${selectedUser._id}`);
  };

  const getMessageTick = (status) => {
    if (status === "seen") return "✓✓";
    if (status === "delivered") return "✓✓";
    return "✓";
  };

  const getTickColor = (status) => {
    if (status === "seen") return "text-blue-400";
    return "text-gray-300";
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const updateLastSeenOnLeave = () => {
      API.put("/user/last-seen").catch(() => {});
    };

    window.addEventListener("beforeunload", updateLastSeenOnLeave);

    return () => {
      updateLastSeenOnLeave();
      window.removeEventListener("beforeunload", updateLastSeenOnLeave);
    };
  }, []);

  const showBrowserNotification = (data) => {
    if (!data || data.sender === userId || data.senderId === userId) return;

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("New SkillSphere message", {
        body: data.message || "New media message",
      });
    }
  };

  useEffect(() => {
    if (!userId) return;

    socket.emit("join_room", userId);

    const handleReceiveMessage = (data) => {
      showBrowserNotification(data);

      setMessages((prev) => {
        const exists = prev.some(
          (m) => m._id && data._id && m._id === data._id
        );
        if (exists) return prev;
        return [...prev, data];
      });
    };

    const handleEditedMessage = (updatedMessage) => {
      if (!updatedMessage?._id) return;
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
      );
    };

    const handleDeletedMessage = (data) => {
      if (!data?.messageId) return;
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
    };

    const handleReactMessage = (updatedMessage) => {
      if (!updatedMessage?._id) return;
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
      );
    };

    const handleOnlineUsers = (users) => setOnlineUsers(users || []);

    const handleTyping = (data) => {
      if (data.senderId === selectedUser?._id) setTypingUser(true);
    };

    const handleStopTyping = (data) => {
      if (data.senderId === selectedUser?._id) setTypingUser(false);
    };

    const handleIncomingVideoCall = (data) => {
      setIncomingVideoCall(data);

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Incoming Video Call", {
          body: `${data.callerName} is calling you`,
        });
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("edit_message", handleEditedMessage);
    socket.on("delete_message", handleDeletedMessage);
    socket.on("react_message", handleReactMessage);
    socket.on("online_users", handleOnlineUsers);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("video_incoming_call", handleIncomingVideoCall);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("edit_message", handleEditedMessage);
      socket.off("delete_message", handleDeletedMessage);
      socket.off("react_message", handleReactMessage);
      socket.off("online_users", handleOnlineUsers);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("video_incoming_call", handleIncomingVideoCall);
    };
  }, [userId, selectedUser]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeImagePreview();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const fetchChat = async (user) => {
    setSelectedUser(user);
    setTypingUser(false);
    setSearchText("");
    setEditMessageId(null);
    setEditText("");
    setReplyTo(null);

    try {
      const res = await API.get(`/messages/${user._id}`);
      setMessages(res.data.messages || []);

      await API.put(`/messages/seen-all/${user._id}`);

      setMessages((prev) =>
        prev.map((m) =>
          m.sender === user._id && m.receiver === userId
            ? { ...m, status: "seen", seenAt: new Date().toISOString() }
            : m
        )
      );
    } catch (err) {
      alert("Failed to load chat");
    }
  };

  const toBase64 = (inputFile) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(inputFile);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const sendMessage = async () => {
    if (!message.trim() && !file) return;
    if (!selectedUser) return;

    let imageBase64 = "";
    let audioBase64 = "";
    let fileData = { url: "", name: "", type: "", size: 0 };

    if (file) {
      const base64 = await toBase64(file);

      if (file.type.startsWith("image/")) {
        imageBase64 = base64;
      } else if (file.type.startsWith("audio/")) {
        audioBase64 = base64;
      } else {
        fileData = {
          url: base64,
          name: file.name,
          type: file.type,
          size: file.size,
        };
      }
    }

    const msgData = {
      senderId: userId,
      receiverId: selectedUser._id,
      message: message.trim(),
      image: imageBase64,
      audio: audioBase64,
      file: fileData,
      replyTo,
      status: "sent",
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await API.post("/messages/send", {
        receiver: selectedUser._id,
        message: message.trim(),
        image: imageBase64,
        audio: audioBase64,
        file: fileData,
        replyTo: replyTo?._id || null,
      });

      const savedMessage = res?.data?.message || msgData;

      setMessages((prev) => [...prev, savedMessage]);

      socket.emit("send_message", savedMessage);
    } catch (err) {
      socket.emit("send_message", msgData);
    }

    socket.emit("stop_typing", {
      senderId: userId,
      receiverId: selectedUser._id,
    });

    setMessage("");
    setFile(null);
    setReplyTo(null);
    setShowEmojiPicker(false);
  };

  const handleTyping = (value) => {
    setMessage(value);
    if (!selectedUser) return;

    socket.emit("typing", {
      senderId: userId,
      receiverId: selectedUser._id,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        senderId: userId,
        receiverId: selectedUser._id,
      });
    }, 1000);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const audioFile = new File([audioBlob], "voice-message.webm", {
        type: "audio/webm",
      });
      setFile(audioFile);
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const startEdit = (msg) => {
    if (!msg?._id) return;
    setEditMessageId(msg._id);
    setEditText(msg.message || "");
  };

  const cancelEdit = () => {
    setEditMessageId(null);
    setEditText("");
  };

  const saveEdit = async (id) => {
    if (!id) return alert("Message id missing");
    if (!editText.trim()) return alert("Message cannot be empty");

    try {
      const res = await API.put(`/messages/${id}`, {
        message: editText.trim(),
      });

      const updated = res?.data?.message || {
        ...messages.find((m) => m._id === id),
        message: editText.trim(),
        isEdited: true,
        updatedAt: new Date().toISOString(),
      };

      setMessages((prev) => prev.map((m) => (m._id === id ? updated : m)));
      socket.emit("edit_message", updated);

      setEditMessageId(null);
      setEditText("");
    } catch (err) {
      alert("Edit failed");
    }
  };

  const deleteMessage = async (id) => {
    if (!id) return;

    try {
      const res = await API.delete(`/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));

      socket.emit("delete_message", {
        messageId: id,
        receiverId: res?.data?.receiverId || selectedUser?._id,
        senderId: userId,
      });

      if (editMessageId === id) cancelEdit();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const clearChat = async () => {
    if (!selectedUser) return;

    const confirmClear = window.confirm(
      `Clear all messages with ${selectedUser.fullName}?`
    );

    if (!confirmClear) return;

    try {
      await API.delete(`/messages/clear/${selectedUser._id}`);

      setMessages([]);

      socket.emit("clear_chat", {
        senderId: userId,
        receiverId: selectedUser._id,
      });

      setReplyTo(null);
      setEditMessageId(null);
      setEditText("");

      alert("Chat cleared successfully.");
    } catch (err) {
      console.log(err);
      alert("Failed to clear chat.");
    }
  };

  const reactToMessage = async (id, emoji) => {
    if (!id || !emoji) return;

    try {
      const res = await API.put(`/messages/react/${id}`, { emoji });
      const updated = res?.data?.message;
      if (!updated) return;

      setMessages((prev) => prev.map((m) => (m._id === id ? updated : m)));
      socket.emit("react_message", updated);
    } catch (err) {
      alert("Reaction failed");
    }
  };

  const acceptVideoCall = () => {
  if (!incomingVideoCall) return;

  const callerId = incomingVideoCall.callerId;

  sessionStorage.setItem(
    "incomingVideoCall",
    JSON.stringify(incomingVideoCall)
  );

  setIncomingVideoCall(null);

  navigate(`/video-call?incoming=true&callerId=${callerId}`);
};

  const rejectVideoCall = () => {
    if (!incomingVideoCall) return;

    socket.emit("video_reject_call", {
      callerId: incomingVideoCall.callerId,
      receiverId: userId,
    });

    setIncomingVideoCall(null);
  };

  const exportChat = () => {
    const text = messages
      .map((m) => {
        const sender =
          m.sender === userId || m.senderId === userId
            ? "Me"
            : selectedUser?.fullName || "User";

        return `[${formatTime(m.createdAt)}] ${sender}: ${
          m.message || m.file?.name || "Media message"
        }`;
      })
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `skillsphere-chat-${selectedUser?.fullName || "user"}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const mediaMessages = messages.filter(
    (m) => m.image || m.audio || m.file?.url
  );

  const filteredMessages = messages.filter((msg) => {
    if (!searchText) return true;
    return (
      msg.message?.toLowerCase().includes(searchText.toLowerCase()) ||
      msg.file?.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const selectedUserOnline = selectedUser
    ? onlineUsers.includes(selectedUser._id)
    : false;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto bg-slate-800 p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Chat System</h2>

        <UserList onSelectUser={fetchChat} onlineUsers={onlineUsers} />

        {selectedUser && (
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-blue-400">Chat with: {selectedUser.fullName}</p>

              {selectedUserOnline ? (
                <p className="text-green-400 text-xs">● Online</p>
              ) : (
                <p className="text-gray-400 text-xs">
                  Last seen: {formatLastSeen(selectedUser.lastSeen)}
                </p>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={startVideoCall}
                className="text-xs bg-green-600 px-2 py-1 rounded hover:bg-green-700"
              >
                📹 Video Call
              </button>

              <button
                onClick={() => setShowGallery(!showGallery)}
                className="text-xs bg-slate-700 px-2 py-1 rounded"
              >
                Media
              </button>

              <button
                onClick={exportChat}
                className="text-xs bg-slate-700 px-2 py-1 rounded"
              >
                Export
              </button>

              <button
                onClick={clearChat}
                className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700"
              >
                Clear Chat
              </button>
            </div>
          </div>
        )}

        {typingUser && <p className="text-green-400 text-sm mb-2">typing...</p>}

        {showGallery && (
          <div className="bg-slate-700 p-3 rounded mb-3">
            <p className="font-semibold mb-2">Media Gallery</p>
            <div className="grid grid-cols-3 gap-2">
              {mediaMessages.map((m, index) => (
                <div key={index} className="bg-slate-800 p-2 rounded text-xs">
                  {m.image && <img src={m.image} alt="media" className="rounded" />}
                  {m.audio && <audio controls src={m.audio} className="w-full" />}
                  {m.file?.url && (
                    <a
                      href={m.file.url}
                      download={m.file.name}
                      className="text-blue-300 underline"
                    >
                      {m.file.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedUser && (
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search messages..."
            className="w-full p-2 mb-3 bg-slate-700 rounded"
          />
        )}

        <div className="h-96 overflow-y-auto bg-slate-700 p-3 rounded mb-4">
          {filteredMessages.map((msg, i) => {
            const isMine = msg.senderId === userId || msg.sender === userId;
            const isEditing = editMessageId === msg._id;

            return (
              <div
                key={msg._id || i}
                className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div className="bg-slate-600 p-2 rounded max-w-xs">
                  {isEditing ? (
                    <>
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-1 text-black rounded"
                      />

                      <div className="flex gap-3 mt-1">
                        <button onClick={() => saveEdit(msg._id)} className="text-green-400 text-xs">
                          Save
                        </button>
                        <button onClick={cancelEdit} className="text-red-400 text-xs">
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {msg.replyTo && (
                        <div className="border-l-2 border-blue-400 pl-2 mb-2 text-xs text-gray-300">
                          Reply: {msg.replyTo.message || msg.replyTo.file?.name || "Media"}
                        </div>
                      )}

                      {msg.message && <p>{msg.message}</p>}

                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="chat upload"
                          onClick={() => openImagePreview(msg.image)}
                          className="mt-2 rounded max-w-[200px] cursor-pointer hover:opacity-90 transition"
                        />
                      )}

                      {msg.audio && <audio controls src={msg.audio} className="mt-2 w-full" />}

                      {msg.file?.url && (
                        <a href={msg.file.url} download={msg.file.name} className="block mt-2 text-blue-300 underline">
                          📎 {msg.file.name}
                        </a>
                      )}

                      {msg.reactions?.length > 0 && (
                        <div className="flex gap-1 mt-2 text-sm">
                          {msg.reactions.map((reaction, index) => (
                            <span key={index} className="bg-slate-700 px-2 py-0.5 rounded-full">
                              {reaction.emoji}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-300 mt-1 text-right">
                        {formatTime(msg.createdAt || msg.updatedAt)}
                        {msg.isEdited && " • edited"}
                        {isMine && (
                          <span className={`ml-2 ${getTickColor(msg.status)}`}>
                            {getMessageTick(msg.status)}
                          </span>
                        )}
                      </p>

                      <div className="flex gap-2 mt-2 flex-wrap">
                        {reactionEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => reactToMessage(msg._id, emoji)}
                            className="text-xs bg-slate-700 px-2 py-1 rounded hover:bg-slate-600"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-3 mt-1">
                        <button onClick={() => setReplyTo(msg)} className="text-yellow-300 text-xs">
                          Reply
                        </button>

                        {isMine && msg._id && msg.message && (
                          <button onClick={() => startEdit(msg)} className="text-blue-400 text-xs">
                            Edit
                          </button>
                        )}

                        {isMine && msg._id && (
                          <button onClick={() => deleteMessage(msg._id)} className="text-red-400 text-xs">
                            Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {replyTo && (
          <div className="bg-slate-700 p-2 rounded mb-2 text-sm">
            Replying to: {replyTo.message || replyTo.file?.name || "Media"}
            <button onClick={() => setReplyTo(null)} className="ml-3 text-red-400">
              Cancel
            </button>
          </div>
        )}

        {showEmojiPicker && (
          <div className="bg-slate-700 p-2 rounded mb-2 flex gap-2 flex-wrap">
            {messageEmojis.map((emoji) => (
              <button key={emoji} onClick={() => setMessage((prev) => prev + emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            className="p-2 bg-slate-700 rounded"
            placeholder="Type message..."
          />

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="bg-slate-700 px-3 py-2 rounded"
            >
              😊
            </button>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-sm"
            />

            {!isRecording ? (
              <button onClick={startRecording} className="bg-red-600 px-3 py-2 rounded">
                Record
              </button>
            ) : (
              <button onClick={stopRecording} className="bg-yellow-600 px-3 py-2 rounded">
                Stop
              </button>
            )}

            <button onClick={sendMessage} className="bg-green-600 px-4 py-2 rounded">
              Send
            </button>
          </div>

          {file && (
            <p className="text-xs text-gray-300">
              Selected: {file.name}
              <button onClick={() => setFile(null)} className="ml-2 text-red-400">
                Remove
              </button>
            </p>
          )}
        </div>
      </div>

      {showImagePreview && (
        <div
          onClick={closeImagePreview}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        >
          <button
            onClick={closeImagePreview}
            className="absolute top-5 right-5 text-white text-3xl"
          >
            ✕
          </button>

          <img
            src={previewImage}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
          />
        </div>
      )}

      {incomingVideoCall && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded text-center max-w-sm w-full">
            <h3 className="text-xl font-bold mb-3">Incoming Video Call</h3>

            <p className="mb-4">{incomingVideoCall.callerName} is calling you</p>

            <div className="flex justify-center gap-3">
              <button
                onClick={acceptVideoCall}
                className="bg-green-600 px-4 py-2 rounded"
              >
                Accept
              </button>

              <button
                onClick={rejectVideoCall}
                className="bg-red-600 px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;