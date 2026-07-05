import StarRating from "./StarRating";

function ReviewCard({ review }) {
  return (
    <div className="bg-slate-700 p-4 rounded-xl border border-slate-600">
      <div className="flex justify-between gap-3">
        <div>
          <p className="font-bold">
            {review.reviewer?.fullName || "User"}
          </p>

          <StarRating rating={review.rating} />
        </div>

        <p className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </div>

      {review.comment && (
        <p className="text-gray-300 mt-2">
          "{review.comment}"
        </p>
      )}

      {review.exchange && (
        <p className="text-xs text-gray-400 mt-2">
          Exchange: {review.exchange.offeredSkill} ↔{" "}
          {review.exchange.wantedSkill}
        </p>
      )}
    </div>
  );
}

export default ReviewCard;