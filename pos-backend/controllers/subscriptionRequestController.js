const createHttpError = require("http-errors");
const mongoose = require("mongoose");

const SubscriptionRequest = require("../models/subscriptionRequestModel");
const User = require("../models/userModel");

const {
  BUSINESS_PLANS,
  calculateAmount,
  calculateExpiry,
} = require("../config/pricing");


// ============================================================
// CREATE SUBSCRIPTION REQUEST
// POST /api/subscription-request
// ============================================================

const createSubscriptionRequest = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return next(createHttpError(401, "Authentication required."));
    }

    const {
      plan,
      duration,
      paymentReference,
      paymentNote,
    } = req.body;

    // Basic validation
    if (!plan || !duration || !paymentReference) {
      return next(
        createHttpError(
          400,
          "Plan, duration and payment reference are required."
        )
      );
    }

    // Only valid business plans are allowed
    if (!BUSINESS_PLANS[plan]) {
      return next(createHttpError(400, "Invalid subscription plan."));
    }

    // Only valid durations are allowed
    if (!BUSINESS_PLANS[plan].prices[duration]) {
      return next(createHttpError(400, "Invalid subscription duration."));
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return next(createHttpError(404, "User not found."));
    }

    // Only Admin accounts can purchase the restaurant subscription.
    // Staff subscriptions are handled separately.
    if (user.role !== "Admin") {
      return next(
        createHttpError(
          403,
          "Only Admin accounts can purchase a business subscription."
        )
      );
    }

    // Don't allow multiple pending requests at the same time.
    const existingPendingRequest = await SubscriptionRequest.findOne({
      user: user._id,
      status: "Pending",
    });

    if (existingPendingRequest) {
      return next(
        createHttpError(
          400,
          "You already have a pending subscription request."
        )
      );
    }

    // IMPORTANT:
    // Amount is calculated on the SERVER.
    // Never trust amount coming from frontend.
    const amount = calculateAmount({
      role: "Admin",
      plan,
      duration,
      isLinkedToAdmin: false,
    });

    const request = new SubscriptionRequest({
      user: user._id,
      name: user.name,
      email: user.email,
      plan,
      duration,
      amount,
      paymentReference: paymentReference.trim(),
      paymentNote: paymentNote?.trim() || "",
      status: "Pending",
    });

    await request.save();

    res.status(201).json({
      success: true,
      message:
        "Subscription request submitted successfully. Waiting for Admin approval.",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// GET MY SUBSCRIPTION REQUESTS
// GET /api/subscription-request/my
// ============================================================

const getMySubscriptionRequests = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return next(createHttpError(401, "Authentication required."));
    }

    const requests = await SubscriptionRequest.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .select(
        "-__v"
      );

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// GET ALL SUBSCRIPTION REQUESTS
// GET /api/subscription-request/all
//
// Admin middleware already protects this route.
// ============================================================

const getAllSubscriptionRequests = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return next(createHttpError(401, "Authentication required."));
    }

    // Extra server-side protection.
    // Never rely only on frontend hiding the Admin panel.
    const admin = await User.findById(req.user._id).select("role");

    if (!admin || admin.role !== "Admin") {
      return next(createHttpError(403, "Admin access required."));
    }

    const requests = await SubscriptionRequest.find()
      .populate("user", "name email phone role subscription")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// REVIEW SUBSCRIPTION REQUEST
// PATCH /api/subscription-request/:id/review
//
// Admin can:
//   Approved
//   Rejected
// ============================================================

const reviewSubscriptionRequest = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return next(createHttpError(401, "Authentication required."));
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(
        createHttpError(400, "Invalid subscription request id.")
      );
    }

    // Extra Admin verification
    const admin = await User.findById(req.user._id).select("role");

    if (!admin || admin.role !== "Admin") {
      return next(createHttpError(403, "Admin access required."));
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return next(
        createHttpError(
          400,
          "Status must be either Approved or Rejected."
        )
      );
    }

    const request = await SubscriptionRequest.findById(id);

    if (!request) {
      return next(
        createHttpError(404, "Subscription request not found.")
      );
    }

    // Don't allow an already processed request to be changed again.
    if (request.status !== "Pending") {
      return next(
        createHttpError(
          400,
          `This request has already been ${request.status.toLowerCase()}.`
        )
      );
    }

    const user = await User.findById(request.user);

    if (!user) {
      return next(
        createHttpError(
          404,
          "The user associated with this request no longer exists."
        )
      );
    }


    // ========================================================
    // REJECT
    // ========================================================

    if (status === "Rejected") {
      request.status = "Rejected";
      request.reviewedAt = new Date();
      request.reviewedBy = admin._id;
      request.rejectionReason =
        rejectionReason?.trim() || "Payment could not be verified.";

      await request.save();

      return res.status(200).json({
        success: true,
        message: "Subscription request rejected.",
        data: request,
      });
    }


    // ========================================================
    // APPROVE
    // ========================================================

    // Recalculate amount again.
    // This protects against somebody modifying the request amount
    // directly in the database.
    const expectedAmount = calculateAmount({
      role: "Admin",
      plan: request.plan,
      duration: request.duration,
      isLinkedToAdmin: false,
    });

    if (request.amount !== expectedAmount) {
      return next(
        createHttpError(
          400,
          "Subscription amount mismatch. Request cannot be approved."
        )
      );
    }

    const now = new Date();

    /*
     * If the user already has an active subscription,
     * extend from the existing expiry date.
     *
     * Example:
     * Existing expiry = 10 September
     * New Monthly plan
     * New expiry = 10 October
     *
     * Otherwise start from today.
     */
    let subscriptionStartDate = now;

    if (
      user.subscription?.expiryDate &&
      new Date(user.subscription.expiryDate) > now
    ) {
      subscriptionStartDate = new Date(
        user.subscription.expiryDate
      );
    }

    const expiryDate = calculateExpiry(
      request.duration,
      subscriptionStartDate
    );

    // Update user's actual subscription
    user.subscription = {
      plan: request.plan,
      duration: request.duration,
      amountPaid: request.amount,
      startDate: now,
      expiryDate,
      linkedAdminEmail: null,
    };

    await user.save();


    // Update request
    request.status = "Approved";
    request.reviewedAt = now;
    request.reviewedBy = admin._id;
    request.subscriptionExpiry = expiryDate;
    request.rejectionReason = "";

    await request.save();

    // Don't expose unnecessary user data.
    const updatedUser = await User.findById(user._id)
      .select("-password");

    res.status(200).json({
      success: true,
      message: "Subscription approved successfully.",
      data: {
        request,
        user: updatedUser,
      },
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