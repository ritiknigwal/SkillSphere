import AvailabilityCard from "./AvailabilityCard";

function AvailabilityList({ slots, onDelete }) {
  if (slots.length === 0) {
    return (
      <div className="text-center text-slate-400 py-10">
        No availability slots added yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {slots.map((slot) => (
        <AvailabilityCard
          key={slot._id}
          slot={slot}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default AvailabilityList;