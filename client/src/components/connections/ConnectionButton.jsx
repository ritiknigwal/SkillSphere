import { useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";

function ConnectionButton({ profileUserId }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  const fetchConnections = async () => {
    try {
      const res = await API.get("/connections/my");
      setConnections(res.data.connections || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const currentConnection = connections.find(
    (connection) =>
      connection.sender?._id === profileUserId ||
      connection.receiver?._id === profileUserId
  );

  const sendRequest = async () => {
    try {
      setLoading(true);

      await API.post("/connections/send", {
        receiver: profileUserId,
      });

      toast.success("Connection request sent");
      fetchConnections();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  if (!profileUserId || profileUserId === userId) {
    return null;
  }

  if (currentConnection?.status === "Accepted") {
    return (
      <button
        disabled
        className="bg-green-700 py-3 rounded-xl cursor-not-allowed"
      >
        ✅ Connected
      </button>
    );
  }

  if (currentConnection?.status === "Pending") {
    return (
      <button
        disabled
        className="bg-yellow-600 py-3 rounded-xl cursor-not-allowed"
      >
        ⏳ Request Pending
      </button>
    );
  }

  if (currentConnection?.status === "Rejected") {
    return (
      <button
        disabled
        className="bg-gray-600 py-3 rounded-xl cursor-not-allowed"
      >
        Request Rejected
      </button>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={loading}
      className="bg-purple-600 py-3 rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
    >
      {loading ? "Sending..." : "🤝 Connect"}
    </button>
  );
}

export default ConnectionButton;