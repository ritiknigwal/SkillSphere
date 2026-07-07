import { useEffect, useState } from "react";
import API from "../api/axios";
import ReviewList from "../components/reviews/ReviewList";
import { toast } from "react-toastify";

function Reviews() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return "";

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id || payload._id || payload.userId || "";
    } catch (err) {
      return "";
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUserId(res.data.user?._id || res.data._id || "");
    } catch (err) {
      const idFromToken = getUserIdFromToken();

      if (idFromToken) {
        setUserId(idFromToken);
      } else {
        toast.error("Failed to load reviews");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-6 mb-6">
          <h1 className="text-4xl font-bold">⭐ Reviews & Ratings</h1>
          <p className="text-yellow-100 mt-2">
            View reviews and ratings received on your profile.
          </p>
        </div>

        {loading ? (
          <div className="bg-slate-800 p-5 rounded-xl">
            Loading reviews...
          </div>
        ) : userId ? (
          <ReviewList userId={userId} />
        ) : (
          <div className="bg-slate-800 p-5 rounded-xl">
            No reviews found.
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;