import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import ReviewForm from "../components/reviews/ReviewForm";

const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://skillsphere-1k44.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

function Exchange() {
  const [users, setUsers] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [exchanges, setExchanges] = useState([]);

  const userId = localStorage.getItem("userId");

  const [form, setForm] = useState({
    receiver: "",
    offeredSkill: "",
    wantedSkill: "",
    message: "",
  });

  const fetchUsers = async () => {
    const res = await API.get("/user/all");
    setUsers(res.data.users || []);
  };

  const fetchMySkills = async () => {
    const res = await API.get("/skills/my-skills");
    setMySkills(res.data.skills || []);
  };

  const fetchExchanges = async () => {
    const res = await API.get("/exchanges/my");
    setExchanges(res.data.exchanges || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchMySkills();
    fetchExchanges();

    if (userId) {
      socket.emit("join_room", userId);
    }

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const handleExchangeNotification = (data) => {
      fetchExchanges();

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("SkillSphere Exchange", {
          body: data.message || "Exchange update received",
        });
      } else {
        alert(data.message || "Exchange update received");
      }
    };

    socket.on("exchange_notification", handleExchangeNotification);

    return () => {
      socket.off("exchange_notification", handleExchangeNotification);
    };
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const sendRequest = async (e) => {
    e.preventDefault();

    try {
      await API.post("/exchanges/send", form);

      alert("Exchange request sent successfully");

      setForm({
        receiver: "",
        offeredSkill: "",
        wantedSkill: "",
        message: "",
      });

      fetchExchanges();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  const acceptRequest = async (id) => {
    await API.put(`/exchanges/accept/${id}`);
    fetchExchanges();
  };

  const rejectRequest = async (id) => {
    await API.put(`/exchanges/reject/${id}`);
    fetchExchanges();
  };

  const cancelRequest = async (id) => {
    await API.put(`/exchanges/cancel/${id}`);
    fetchExchanges();
  };

  const completeRequest = async (id) => {
    await API.put(`/exchanges/complete/${id}`);
    fetchExchanges();
  };

  const getStatusColor = (status) => {
    if (status === "pending") return "bg-yellow-600";
    if (status === "accepted") return "bg-green-600";
    if (status === "rejected") return "bg-red-600";
    if (status === "cancelled") return "bg-gray-600";
    if (status === "completed") return "bg-blue-600";
    return "bg-slate-600";
  };

  const receivedRequests = exchanges.filter(
    (ex) => ex.receiver?._id === userId && ex.status === "pending"
  );

  const sentRequests = exchanges.filter(
    (ex) => ex.requester?._id === userId && ex.status === "pending"
  );

  const ongoingExchanges = exchanges.filter((ex) => ex.status === "accepted");

  const historyExchanges = exchanges.filter(
    (ex) =>
      ex.status === "rejected" ||
      ex.status === "cancelled" ||
      ex.status === "completed"
  );

  const ExchangeCard = ({ exchange }) => {
    const isReceiver = exchange.receiver?._id === userId;
    const isRequester = exchange.requester?._id === userId;

    return (
      <div className="bg-slate-700 p-4 rounded-xl border border-slate-600">
        <div className="flex justify-between items-start gap-3">
          <div>
            <p>
              <span className="font-bold">From:</span>{" "}
              {exchange.requester?.fullName}
            </p>

            <p>
              <span className="font-bold">To:</span>{" "}
              {exchange.receiver?.fullName}
            </p>

            <p className="mt-2">
              <span className="font-bold">Offers:</span>{" "}
              {exchange.offeredSkill}
            </p>

            <p>
              <span className="font-bold">Wants:</span>{" "}
              {exchange.wantedSkill}
            </p>

            {exchange.message && (
              <p className="text-slate-300 mt-2">"{exchange.message}"</p>
            )}
          </div>

          <span
            className={`${getStatusColor(
              exchange.status
            )} px-3 py-1 rounded text-sm capitalize`}
          >
            {exchange.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {exchange.status === "pending" && isReceiver && (
            <>
              <button
                onClick={() => acceptRequest(exchange._id)}
                className="bg-green-600 px-4 py-2 rounded"
              >
                Accept
              </button>

              <button
                onClick={() => rejectRequest(exchange._id)}
                className="bg-red-600 px-4 py-2 rounded"
              >
                Reject
              </button>
            </>
          )}

          {exchange.status === "pending" && isRequester && (
            <button
              onClick={() => cancelRequest(exchange._id)}
              className="bg-gray-600 px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}

          {exchange.status === "accepted" && (
            <button
              onClick={() => completeRequest(exchange._id)}
              className="bg-blue-600 px-4 py-2 rounded"
            >
              Mark Completed
            </button>
          )}
        </div>

        {exchange.status === "completed" && (
          <ReviewForm
            exchangeId={exchange._id}
            onReviewSubmitted={fetchExchanges}
          />
        )}
      </div>
    );
  };

  const Section = ({ title, data, emptyText }) => (
    <div className="bg-slate-800 p-5 rounded-xl mb-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      {data.length === 0 ? (
        <p className="text-slate-400">{emptyText}</p>
      ) : (
        <div className="space-y-4">
          {data.map((exchange) => (
            <ExchangeCard key={exchange._id} exchange={exchange} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Skill Exchange</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-5 rounded-xl h-fit">
            <h2 className="text-xl font-bold mb-4">Send Exchange Request</h2>

            <form onSubmit={sendRequest} className="space-y-4">
              <select
                name="receiver"
                value={form.receiver}
                onChange={handleChange}
                required
                className="w-full p-3 rounded bg-slate-700 border border-slate-600"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.fullName}
                  </option>
                ))}
              </select>

              <select
                name="offeredSkill"
                value={form.offeredSkill}
                onChange={handleChange}
                required
                className="w-full p-3 rounded bg-slate-700 border border-slate-600"
              >
                <option value="">Skill You Offer</option>
                {mySkills.map((skill) => (
                  <option key={skill._id} value={skill.name}>
                    {skill.name} ({skill.level})
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="wantedSkill"
                value={form.wantedSkill}
                onChange={handleChange}
                placeholder="Skill You Want To Learn"
                required
                className="w-full p-3 rounded bg-slate-700 border border-slate-600"
              />

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Optional message..."
                rows="4"
                className="w-full p-3 rounded bg-slate-700 border border-slate-600"
              />

              <button
                type="submit"
                className="w-full bg-green-600 py-2 rounded hover:bg-green-700"
              >
                Send Request
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <Section
              title="Received Requests"
              data={receivedRequests}
              emptyText="No received requests."
            />

            <Section
              title="Sent Requests"
              data={sentRequests}
              emptyText="No sent pending requests."
            />

            <Section
              title="Ongoing Exchanges"
              data={ongoingExchanges}
              emptyText="No ongoing exchanges."
            />

            <Section
              title="Exchange History"
              data={historyExchanges}
              emptyText="No exchange history."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Exchange;