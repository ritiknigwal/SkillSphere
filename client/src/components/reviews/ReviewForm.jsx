import { useState } from "react";
import API from "../../api/axios";
import StarRating from "./StarRating";
import { toast } from "react-toastify";

function ReviewForm({ exchangeId, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      await API.post("/reviews", {
        exchangeId,
        rating,
        comment,
      });

      toast.success("Review submitted successfully");

      setRating(5);
      setComment("");

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <form
      onSubmit={submitReview}
      className="bg-slate-800 p-4 rounded-xl border border-slate-600 mt-3"
    >
      <h3 className="font-bold mb-2">Leave a Review</h3>

      <StarRating rating={rating} setRating={setRating} editable />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review..."
        rows="3"
        className="w-full mt-3 p-3 rounded bg-slate-700 border border-slate-600"
      />

      <button
        type="submit"
        className="bg-yellow-600 px-4 py-2 rounded mt-3 hover:bg-yellow-700"
      >
        Submit Review
      </button>
    </form>
  );
}

export default ReviewForm;