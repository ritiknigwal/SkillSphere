import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    exchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exchange",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index(
  { reviewer: 1, exchange: 1 },
  { unique: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;