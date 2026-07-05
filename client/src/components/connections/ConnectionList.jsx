import ConnectionCard from "./ConnectionCard";

function ConnectionList({
  title,
  connections,
  emptyText,
  userId,
  onAccept,
  onReject,
  onRemove,
}) {
  return (
    <div className="bg-slate-800 p-5 rounded-xl mb-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      {connections.length === 0 ? (
        <p className="text-slate-400">{emptyText}</p>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection._id}
              connection={connection}
              userId={userId}
              onAccept={onAccept}
              onReject={onReject}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ConnectionList;