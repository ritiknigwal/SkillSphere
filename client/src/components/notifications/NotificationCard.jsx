function NotificationCard({ notification, onRead, onDelete }) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        notification.isRead
          ? "bg-slate-700 border-slate-600"
          : "bg-blue-900/40 border-blue-500"
      }`}
    >
      <div className="flex justify-between gap-3">
        <div>
          <h3 className="font-bold">{notification.title}</h3>

          <p className="text-sm text-slate-300 mt-1">
            {notification.message}
          </p>

          <p className="text-xs text-slate-400 mt-2">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>

        {!notification.isRead && (
          <span className="text-xs bg-blue-600 px-2 py-1 rounded h-fit">
            New
          </span>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        {!notification.isRead && (
          <button
            onClick={() => onRead(notification._id)}
            className="text-xs bg-green-600 px-3 py-1 rounded"
          >
            Mark Read
          </button>
        )}

        <button
          onClick={() => onDelete(notification._id)}
          className="text-xs bg-red-600 px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default NotificationCard;