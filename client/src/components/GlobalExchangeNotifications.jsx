import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://skillsphere-1k44.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

function GlobalExchangeNotifications() {
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.log("No userId found for exchange notifications");
      return;
    }

    const joinUserRoom = () => {
      socket.emit("join_room", userId);
      console.log("Exchange notification room joined:", userId);
    };

    if (socket.connected) {
      joinUserRoom();
    }

    socket.on("connect", joinUserRoom);

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const handleExchangeNotification = (data) => {
      console.log("Exchange notification received:", data);

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("SkillSphere Exchange", {
          body: data.message || "New exchange update",
        });
      } else {
        toast.info(data.message || "New exchange update");
      }
    };

    socket.on("exchange_notification", handleExchangeNotification);

    return () => {
      socket.off("connect", joinUserRoom);
      socket.off("exchange_notification", handleExchangeNotification);
    };
  }, []);

  return null;
}

export default GlobalExchangeNotifications;