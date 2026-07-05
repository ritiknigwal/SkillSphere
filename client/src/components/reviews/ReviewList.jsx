import { useEffect, useState } from "react";
import API from "../../api/axios";
import ReviewCard from "./ReviewCard";

function ReviewList({ userId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    if (!userId) return;

    try {
      const res = await API.get(`/reviews/user/${userId}`);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-slate-800 p-5 rounded-xl mt-6">
        Loading reviews...
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-5 rounded-xl mt-6">
      <h2 className="text-2xl font-bold mb-4">
        Ratings & Reviews
      </h2>

      {reviews.length === 0 ? (
        <p className="text-slate-400">
          No reviews yet.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewList;