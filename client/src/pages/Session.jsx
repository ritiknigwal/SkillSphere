import { useEffect, useState } from "react";
import API from "../api/axios";
import SessionForm from "../components/sessions/SessionForm";
import SessionList from "../components/sessions/SessionList";
import { toast } from "react-toastify";

function Session() {
  const [sessions, setSessions] = useState([]);
  const userId = localStorage.getItem("userId");

  const fetchSessions = async () => {
    try {
      const res = await API.get("/sessions/my");
      setSessions(res.data.sessions || []);
    } catch (err) {
      toast.error("Failed to load sessions");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const acceptSession = async (id) => {
    await API.put(`/sessions/accept/${id}`);
    fetchSessions();
  };

  const rejectSession = async (id) => {
    await API.put(`/sessions/reject/${id}`);
    fetchSessions();
  };

  const cancelSession = async (id) => {
    await API.put(`/sessions/cancel/${id}`);
    fetchSessions();
  };

  const completeSession = async (id) => {
    await API.put(`/sessions/complete/${id}`);
    fetchSessions();
  };

  const pendingSessions = sessions.filter(
    (session) => session.status === "Pending"
  );

  const acceptedSessions = sessions.filter(
    (session) => session.status === "Accepted"
  );

  const historySessions = sessions.filter(
    (session) =>
      session.status === "Rejected" ||
      session.status === "Cancelled" ||
      session.status === "Completed"
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sessions</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-5 rounded-xl h-fit">
            <SessionForm onBooked={fetchSessions} />
          </div>

          <div className="lg:col-span-2">
            <SessionList
              title="Pending Sessions"
              sessions={pendingSessions}
              emptyText="No pending sessions."
              userId={userId}
              onAccept={acceptSession}
              onReject={rejectSession}
              onCancel={cancelSession}
              onComplete={completeSession}
            />

            <SessionList
              title="Accepted Sessions"
              sessions={acceptedSessions}
              emptyText="No accepted sessions."
              userId={userId}
              onAccept={acceptSession}
              onReject={rejectSession}
              onCancel={cancelSession}
              onComplete={completeSession}
            />

            <SessionList
              title="Session History"
              sessions={historySessions}
              emptyText="No session history."
              userId={userId}
              onAccept={acceptSession}
              onReject={rejectSession}
              onCancel={cancelSession}
              onComplete={completeSession}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Session;