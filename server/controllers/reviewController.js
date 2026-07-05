import Review from "../models/Review.js";
import Exchange from "../models/Exchange.js";
import User from "../models/User.js";

const updateUserRating = async (userId) => {
  const reviews = await Review.find({ reviewFor: userId });

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  await User.findByIdAndUpdate(userId, {
    rating: Number(averageRating.toFixed(1)),
    totalReviews,
  });
};

export const createReview = async (req, res) => {
  try {
    const { exchangeId, rating, comment } = req.body;

    if (!exchangeId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Exchange ID and rating are required",
      });
    }

    const exchange = await Exchange.findById(exchangeId);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: "Exchange not found",
      });
    }

    if (exchange.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can review only completed exchanges",
      });
    }

    const isRequester =
      exchange.requester.toString() === req.user._id.toString();

    const isReceiver =
      exchange.receiver.toString() === req.user._id.toString();

    if (!isRequester && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: "Only exchange participants can review",
      });
    }

    const reviewFor = isRequester
      ? exchange.receiver
      : exchange.requester;

    const alreadyReviewed = await Review.findOne({
      reviewer: req.user._id,
      exchange: exchangeId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this exchange",
      });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewFor,
      exchange: exchangeId,
      rating,
      comment: comment || "",
    });

    await updateUserRating(reviewFor);

    const populatedReview = await Review.findById(review._id)
      .populate("reviewer", "fullName profileImage")
      .populate("reviewFor", "fullName profileImage");

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewFor: req.params.userId,
    })
      .populate("reviewer", "fullName profileImage")
      .populate("exchange", "offeredSkill wantedSkill status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewer: req.user._id,
    })
      .populate("reviewFor", "fullName profileImage")
      .populate("exchange", "offeredSkill wantedSkill status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch my reviews",
      error: error.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own review",
      });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();
    await updateUserRating(review.reviewFor);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own review",
      });
    }

    const reviewFor = review.reviewFor;

    await Review.findByIdAndDelete(req.params.id);
    await updateUserRating(reviewFor);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};