import { useEffect, useState } from "react";
import API from "../api/axios";
import AvailabilityForm from "../components/availability/AvailabilityForm";
import AvailabilityList from "../components/availability/AvailabilityList";
import { toast } from "react-toastify";

function Availability() {
  const [slots, setSlots] = useState([]);

  const fetchAvailability = async () => {
    try {
      const res = await API.get("/availability/my");
      setSlots(res.data.availability || []);
    } catch (err) {
      toast.error("Failed to load availability");
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const deleteAvailability = async (id) => {
    try {
      await API.delete(`/availability/${id}`);
      fetchAvailability();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete availability");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Availability Calendar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-5 rounded-xl h-fit">
            <AvailabilityForm onAdded={fetchAvailability} />
          </div>

          <div className="lg:col-span-2 bg-slate-800 p-5 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">My Available Slots</h2>

            <AvailabilityList
              slots={slots}
              onDelete={deleteAvailability}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Availability;