function ConnectionCard({
  connection,
  userId,
  onAccept,
  onReject,
  onRemove,
}) {
  const isReceiver = connection.receiver?._id === userId;
  const isSender = connection.sender?._id === userId;

  const otherUser = isSender ? connection.receiver : connection.sender;

  return (
    <div className="bg-slate-700 p-4 rounded-xl border border-slate-600">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-bold text-lg">
            {otherUser?.fullName}
          </h3>

          <p className="text-slate-400 text-sm">
            {otherUser?.headline || "SkillSphere User"}
          </p>

          <p className="mt-2 text-sm">
            Status:{" "}
            <span className="font-semibold">
              {connection.status}
            </span>
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {connection.status === "Pending" && isReceiver && (
          <>
            <button
              onClick={() => onAccept(connection._id)}
              className="bg-green-600 px-4 py-2 rounded"
            >
              Accept
            </button>

            <button
              onClick={() => onReject(connection._id)}
              className="bg-red-600 px-4 py-2 rounded"
            >
              Reject
            </button>
          </>
        )}

        {connection.status === "Accepted" && (
          <button
            onClick={() => onRemove(connection._id)}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default ConnectionCard;