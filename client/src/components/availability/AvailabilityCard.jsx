function AvailabilityCard({ slot, onDelete }) {
  return (
    <div className="bg-slate-700 p-4 rounded-xl border border-slate-600 flex justify-between items-center gap-4">
      <div>
        <p>
          <span className="font-bold">Date:</span> {slot.date}
        </p>

        <p>
          <span className="font-bold">Time:</span> {slot.startTime} -{" "}
          {slot.endTime}
        </p>

        <p className="text-sm mt-1">
          Status:{" "}
          {slot.isBooked ? (
            <span className="text-red-400">Booked</span>
          ) : (
            <span className="text-green-400">Available</span>
          )}
        </p>
      </div>

      {!slot.isBooked && (
        <button
          onClick={() => onDelete(slot._id)}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Delete
        </button>
      )}
    </div>
  );
}

export default AvailabilityCard;