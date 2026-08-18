const createHttpError = require("http-errors");
const User = require("../models/userModel");


// ======================================================
// CREATE SUBSCRIPTION REQUEST
// ======================================================

const createSubscriptionRequest = async (req, res, next) => {
  try {
    const { plan, duration } = req.body;

    // Only Admin can request a business subscription
    if (req.user.role !== "Admin") {
      return next(
        createHttpError(
          403,
          "Only Admin can create a subscription request."
        )
      );
    }

    if (!plan || !duration) {
      return next(
        createHttpError(
          400,
          "Plan and duration are required."
        )
      );
    }

    const admin = await User.findById(req.user._id);

    if (!admin) {
      return next(
        createHttpError(404, "User not found.")
      );
    }

    // For now subscription request is represented
    // inside the user document.
    admin.subscription = {
      ...(admin.subscription?.toObject?.() || admin.subscription || {}),
      plan,
      duration,
    };

    await admin.save();

    res.status(201).json({
      success: true,
      message: "Subscription request created successfully.",
      data: admin,
    });

  } catch (error) {
    next(error);
  }
};


// ======================================================
// GET MY SUBSCRIPTION
// ======================================================

const getMySubscriptionRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password");

    if (!user) {
      return next(
        createHttpError(404, "User not found.")
      );
    }

    res.status(200).json({
      success: true,
      data: user.subscription || null,
    });

  } catch (error) {
    next(error);
  }
};


// ======================================================
// GET ALL SUBSCRIPTION REQUESTS
// ======================================================

const getAllSubscriptionRequests = async (req, res, next) => {
  try {
    if (req.user.role !== "Admin") {
      return next(
        createHttpError(
          403,
          "Only Admin can view subscription requests."
        )
      );
    }

    const users = await User.find({
      "subscription.plan": {
        $ne: null,
      },
    }).select("-password");

    res.status(200).json({
      success: true,
      data: users,
    });

  } catch (error) {
    next(error);
  }
};


// ======================================================
// REVIEW SUBSCRIPTION REQUEST
// ======================================================

const reviewSubscriptionRequest = async (req, res, next) => {
  try {
    if (req.user.role !== "Admin") {
      return next(
        createHttpError(
          403,
          "Only Admin can review subscription requests."
        )
      );
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return next(
        createHttpError(
          400,
          "Status must be approved or rejected."
        )
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return next(
        createHttpError(
          404,
          "Subscription request user not found."
        )
      );
    }

    res.status(200).json({
      success: true,
      message: `Subscription request ${status}.`,
      data: user,
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  createSubscriptionRequest,
  getMySubscriptionRequests,
  getAllSubscriptionRequests,
  reviewSubscriptionRequest,
};