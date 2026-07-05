function StarRating({ rating = 0, setRating = null, editable = false }) {
  const value = Number(rating) || 0;

  return (
    <div className="flex gap-1 text-xl">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!editable}
          onClick={() => editable && setRating(star)}
          className={
            star <= value
              ? "text-yellow-400"
              : "text-gray-500"
          }
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default StarRating;