import { useEffect, useState } from "react";
import API from "../api/axios";
import ConnectionList from "../components/connections/ConnectionList";
import { toast } from "react-toastify";

function Connections() {
  const [connections, setConnections] = useState([]);
  const userId = localStorage.getItem("userId");

  const fetchConnections = async () => {
    try {
      const res = await API.get("/connections/my");
      setConnections(res.data.connections || []);
    } catch (err) {
      toast.error("Failed to load connections");
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const acceptConnection = async (id) => {
    await API.put(`/connections/accept/${id}`);
    fetchConnections();
  };

  const rejectConnection = async (id) => {
    await API.put(`/connections/reject/${id}`);
    fetchConnections();
  };

  const removeConnection = async (id) => {
    await API.delete(`/connections/${id}`);
    fetchConnections();
  };

  const receivedRequests = connections.filter(
    (connection) =>
      connection.receiver?._id === userId && connection.status === "Pending"
  );

  const sentRequests = connections.filter(
    (connection) =>
      connection.sender?._id === userId && connection.status === "Pending"
  );

  const myConnections = connections.filter(
    (connection) => connection.status === "Accepted"
  );

  const rejectedRequests = connections.filter(
    (connection) => connection.status === "Rejected"
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Connections</h1>

        <ConnectionList
          title="Received Requests"
          connections={receivedRequests}
          emptyText="No received connection requests."
          userId={userId}
          onAccept={acceptConnection}
          onReject={rejectConnection}
          onRemove={removeConnection}
        />

        <ConnectionList
          title="Sent Requests"
          connections={sentRequests}
          emptyText="No sent pending requests."
          userId={userId}
          onAccept={acceptConnection}
          onReject={rejectConnection}
          onRemove={removeConnection}
        />

        <ConnectionList
          title="My Connections"
          connections={myConnections}
          emptyText="No connections yet."
          userId={userId}
          onAccept={acceptConnection}
          onReject={rejectConnection}
          onRemove={removeConnection}
        />

        <ConnectionList
          title="Rejected Requests"
          connections={rejectedRequests}
          emptyText="No rejected requests."
          userId={userId}
          onAccept={acceptConnection}
          onReject={rejectConnection}
          onRemove={removeConnection}
        />
      </div>
    </div>
  );
}

export default Connections;