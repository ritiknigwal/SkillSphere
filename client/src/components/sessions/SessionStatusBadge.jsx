function SessionStatusBadge({ status }) {
  const getColor = () => {
    if (status === "Pending") return "bg-yellow-600";
    if (status === "Accepted") return "bg-green-600";
    if (status === "Rejected") return "bg-red-600";
    if (status === "Cancelled") return "bg-gray-600";
    if (status === "Completed") return "bg-blue-600";
    return "bg-slate-600";
  };

  return (
    <span className={`${getColor()} px-3 py-1 rounded text-sm`}>
      {status}
    </span>
  );
}

export default SessionStatusBadge;