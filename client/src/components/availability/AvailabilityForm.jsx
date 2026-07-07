import { useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";

function AvailabilityForm({ onAdded }) {
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addAvailability = async (e) => {
    e.preventDefault();

    try {
      await API.post("/availability", form);

      toast.success("Availability added successfully");

      setForm({
        date: "",
        startTime: "",
        endTime: "",
      });

      if (onAdded) {
        onAdded();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add availability");
    }
  };

  return (
    <form onSubmit={addAvailability} className="space-y-4">
      <h2 className="text-2xl font-bold">Add Availability</h2>

      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
        className="w-full p-3 rounded bg-slate-700"
      />

      <input
        type="time"
        name="startTime"
        value={form.startTime}
        onChange={handleChange}
        required
        className="w-full p-3 rounded bg-slate-700"
      />

      <input
        type="time"
        name="endTime"
        value={form.endTime}
        onChange={handleChange}
        required
        className="w-full p-3 rounded bg-slate-700"
      />

      <button
        type="submit"
        className="w-full bg-green-600 py-3 rounded hover:bg-green-700"
      >
        Add Slot
      </button>
    </form>
  );
}

export default AvailabilityForm;