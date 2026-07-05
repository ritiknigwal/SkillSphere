import SessionCard from "./SessionCard";

function SessionList({
  title,
  sessions = [],
  emptyText,
  userId,
  onAccept,
  onReject,
  onCancel,
  onComplete,
}) {
  return (
    <div className="bg-slate-800 p-5 rounded-xl mb-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      {sessions.length === 0 ? (
        <p className="text-slate-400">{emptyText}</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              userId={userId}
              onAccept={onAccept}
              onReject={onReject}
              onCancel={onCancel}
              onComplete={onComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SessionList;