import SessionStatusBadge from "./SessionStatusBadge";

function SessionCard({
  session,
  userId,
  onAccept,
  onReject,
  onCancel,
  onComplete,
}) {
  const isTeacher = session.teacher?._id === userId;
  const isLearner = session.learner?._id === userId;

  return (
    <div className="bg-slate-700 p-4 rounded-xl border border-slate-600">
      <div className="flex justify-between items-start gap-3">
        <div>
          <p>
            <span className="font-bold">Learner:</span>{" "}
            {session.learner?.fullName}
          </p>

          <p>
            <span className="font-bold">Teacher:</span>{" "}
            {session.teacher?.fullName}
          </p>

          <p className="mt-2">
            <span className="font-bold">Skill:</span>{" "}
            {session.skill?.name}
          </p>

          <p>
            <span className="font-bold">Date:</span>{" "}
            {new Date(session.sessionDate).toLocaleString()}
          </p>

          <p>
            <span className="font-bold">Duration:</span>{" "}
            {session.duration} minutes
          </p>

          {session.notes && (
            <p className="text-slate-300 mt-2">
              "{session.notes}"
            </p>
          )}
        </div>

        <SessionStatusBadge status={session.status} />
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {session.status === "Pending" && isTeacher && (
          <>
            <button
              onClick={() => onAccept(session._id)}
              className="bg-green-600 px-4 py-2 rounded"
            >
              Accept
            </button>

            <button
              onClick={() => onReject(session._id)}
              className="bg-red-600 px-4 py-2 rounded"
            >
              Reject
            </button>
          </>
        )}

        {session.status === "Pending" && isLearner && (
          <button
            onClick={() => onCancel(session._id)}
            className="bg-gray-600 px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}

        {session.status === "Accepted" && (
          <button
            onClick={() => onComplete(session._id)}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Mark Completed
          </button>
        )}
      </div>
    </div>
  );
}

export default SessionCard;