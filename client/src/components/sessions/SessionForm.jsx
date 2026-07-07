import { useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";

function SessionForm({ onBooked }) {
  const [teachers, setTeachers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [form, setForm] = useState({
    teacher: "",
    skill: "",
    availabilitySlot: "",
    sessionDate: "",
    duration: 60,
    notes: "",
  });

  useEffect(() => {
    fetchTeachers();
    fetchSkills();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await API.get("/user/all");
      setTeachers(res.data.users || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await API.get("/skills/my-skills");
      setSkills(res.data.skills || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTeacherAvailability = async (teacherId) => {
    if (!teacherId) {
      setAvailableSlots([]);
      return;
    }

    try {
      const res = await API.get(`/availability/teacher/${teacherId}`);
      setAvailableSlots(res.data.availability || []);
    } catch (err) {
      console.log(err);
      setAvailableSlots([]);
    }
  };

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    return endTotal - startTotal;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "teacher") {
      setForm({
        ...form,
        teacher: value,
        availabilitySlot: "",
        sessionDate: "",
        duration: 60,
      });

      fetchTeacherAvailability(value);
      return;
    }

    if (name === "availabilitySlot") {
      const selectedSlot = availableSlots.find((slot) => slot._id === value);

      if (selectedSlot) {
        const fullDateTime = `${selectedSlot.date}T${selectedSlot.startTime}`;
        const duration = calculateDuration(
          selectedSlot.startTime,
          selectedSlot.endTime
        );

        setForm({
          ...form,
          availabilitySlot: value,
          sessionDate: fullDateTime,
          duration: duration > 0 ? duration : 60,
        });
      }

      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const bookSession = async (e) => {
    e.preventDefault();

    try {
      await API.post("/sessions/book", form);

      toast.success("Session booked successfully");

      setForm({
        teacher: "",
        skill: "",
        availabilitySlot: "",
        sessionDate: "",
        duration: 60,
        notes: "",
      });

      setAvailableSlots([]);

      if (onBooked) {
        onBooked();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <form onSubmit={bookSession} className="space-y-4">
      <h2 className="text-2xl font-bold">Book Session</h2>

      <select
        name="teacher"
        value={form.teacher}
        onChange={handleChange}
        required
        className="w-full p-3 rounded bg-slate-700"
      >
        <option value="">Select Teacher</option>

        {teachers.map((user) => (
          <option key={user._id} value={user._id}>
            {user.fullName}
          </option>
        ))}
      </select>

      <select
        name="skill"
        value={form.skill}
        onChange={handleChange}
        required
        className="w-full p-3 rounded bg-slate-700"
      >
        <option value="">Select Skill</option>

        {skills.map((skill) => (
          <option key={skill._id} value={skill._id}>
            {skill.name}
          </option>
        ))}
      </select>

      <select
        name="availabilitySlot"
        value={form.availabilitySlot}
        onChange={handleChange}
        required
        disabled={!form.teacher}
        className="w-full p-3 rounded bg-slate-700 disabled:opacity-50"
      >
        <option value="">
          {form.teacher ? "Select Available Slot" : "Select teacher first"}
        </option>

        {availableSlots.map((slot) => (
          <option key={slot._id} value={slot._id}>
            {slot.date} | {slot.startTime} - {slot.endTime}
          </option>
        ))}
      </select>

      <input
        type="datetime-local"
        name="sessionDate"
        value={form.sessionDate}
        onChange={handleChange}
        required
        readOnly
        className="w-full p-3 rounded bg-slate-700 opacity-80"
      />

      <input
        type="number"
        name="duration"
        min="30"
        max="240"
        value={form.duration}
        onChange={handleChange}
        readOnly
        className="w-full p-3 rounded bg-slate-700 opacity-80"
      />

      <textarea
        name="notes"
        rows="4"
        value={form.notes}
        onChange={handleChange}
        placeholder="Session Notes"
        className="w-full p-3 rounded bg-slate-700"
      />

      <button
        type="submit"
        className="w-full bg-green-600 py-3 rounded"
      >
        Book Session
      </button>
    </form>
  );
}

export default SessionForm;