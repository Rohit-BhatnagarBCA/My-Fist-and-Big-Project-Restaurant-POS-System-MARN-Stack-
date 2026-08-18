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
// ============================================================

const createSubscriptionRequest = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?._id) {
      return next(
        createHttpError(
          401,
          "Authentication required."
        )
      );
    }

    const {
      plan,
      duration,
      paymentReference,
      paymentNote,
    } = req.body;

    if (
      !plan ||
      !duration ||
      !paymentReference?.trim()
    ) {
      return next(
        createHttpError(
          400,
          "Plan, duration and payment reference are required."
        )
      );
    }

    if (!BUSINESS_PLANS[plan]) {
      return next(
        createHttpError(
          400,
          "Invalid subscription plan."
        )
      );
    }

    if (!BUSINESS_PLANS[plan].prices?.[duration]) {
      return next(
        createHttpError(
          400,
          "Invalid subscription duration."
        )
      );
    }

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return next(
        createHttpError(
          404,
          "User not found."
        )
      );
    }

    // Only restaurant Admins purchase business plans.
    if (user.role !== "Admin") {
      return next(
        createHttpError(
          403,
          "Only Admin accounts can purchase a business subscription."
        )
      );
    }

    // One pending request at a time.
    const pendingRequest =
      await SubscriptionRequest.findOne({
        user: user._id,
        status: "Pending",
      });

    if (pendingRequest) {
      return next(
        createHttpError(
          400,
          "You already have a pending subscription request."
        )
      );
    }

    // Server-side amount.
    const amount = calculateAmount({
      role: "Admin",
      plan,
      duration,
      isLinkedToAdmin: false,
    });

    const request =
      await SubscriptionRequest.create({
        user: user._id,
        name: user.name,
        email: user.email,
        plan,
        duration,
        amount,
        paymentReference:
          paymentReference.trim(),
        paymentNote:
          paymentNote?.trim() || "",
        status: "Pending",
      });

    return res.status(201).json({
      success: true,
      message:
        "Subscription request submitted successfully. Waiting for Super Admin approval.",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET MY SUBSCRIPTION REQUESTS
// ============================================================

const getMySubscriptionRequests = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?._id) {
      return next(
        createHttpError(
          401,
          "Authentication required."
        )
      );
    }

    const requests =
      await SubscriptionRequest.find({
        user: req.user._id,
      })
        .sort({ createdAt: -1 })
        .select("-__v");

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// SUPER ADMIN — GET ALL REQUESTS
// ============================================================

const getAllSubscriptionRequests = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?._id) {
      return next(
        createHttpError(
          401,
          "Authentication required."
        )
      );
    }

    if (req.user.role !== "SuperAdmin") {
      return next(
        createHttpError(
          403,
          "Super Admin access required."
        )
      );
    }

    const requests =
      await SubscriptionRequest.find()
        .populate(
          "user",
          "name email phone role subscription"
        )
        .populate(
          "reviewedBy",
          "name email role"
        )
        .sort({ createdAt: -1 })
        .select("-__v");

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// SUPER ADMIN — APPROVE / REJECT
// ============================================================

const reviewSubscriptionRequest = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?._id) {
      return next(
        createHttpError(
          401,
          "Authentication required."
        )
      );
    }

    if (req.user.role !== "SuperAdmin") {
      return next(
        createHttpError(
          403,
          "Super Admin access required."
        )
      );
    }

    const { id } = req.params;
    const {
      status,
      rejectionReason,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return next(
        createHttpError(
          400,
          "Invalid subscription request id."
        )
      );
    }

    if (
      !["Approved", "Rejected"].includes(
        status
      )
    ) {
      return next(
        createHttpError(
          400,
          "Status must be either Approved or Rejected."
        )
      );
    }

    const request =
      await SubscriptionRequest.findById(id);

    if (!request) {
      return next(
        createHttpError(
          404,
          "Subscription request not found."
        )
      );
    }

    if (request.status !== "Pending") {
      return next(
        createHttpError(
          400,
          `This request has already been ${request.status.toLowerCase()}.`
        )
      );
    }

    const user =
      await User.findById(request.user);

    if (!user) {
      return next(
        createHttpError(
          404,
          "The associated user no longer exists."
        )
      );
    }

    const now = new Date();

    // --------------------------------------------------------
    // REJECT
    // --------------------------------------------------------

    if (status === "Rejected") {
      request.status = "Rejected";
      request.reviewedAt = now;
      request.reviewedBy =
        req.user._id;

      request.rejectionReason =
        rejectionReason?.trim() ||
        "Payment could not be verified.";

      await request.save();

      return res.status(200).json({
        success: true,
        message:
          "Subscription request rejected.",
        data: request,
      });
    }

    // --------------------------------------------------------
    // APPROVE
    // --------------------------------------------------------

    const expectedAmount =
      calculateAmount({
        role: "Admin",
        plan: request.plan,
        duration: request.duration,
        isLinkedToAdmin: false,
      });

    if (
      request.amount !==
      expectedAmount
    ) {
      return next(
        createHttpError(
          400,
          "Subscription amount mismatch. Request cannot be approved."
        )
      );
    }

    let subscriptionStart = now;

    const currentExpiry =
      user.subscription?.expiryDate
        ? new Date(
            user.subscription.expiryDate
          )
        : null;

    if (
      currentExpiry &&
      !Number.isNaN(
        currentExpiry.getTime()
      ) &&
      currentExpiry > now
    ) {
      subscriptionStart =
        currentExpiry;
    }

    const expiryDate =
      calculateExpiry(
        request.duration,
        subscriptionStart
      );

    user.subscription = {
      plan: request.plan,
      duration: request.duration,
      amountPaid: request.amount,

      startDate: now,
      expiryDate,

      linkedAdminEmail: null,
    };

    await user.save();

    request.status = "Approved";
    request.reviewedAt = now;
    request.reviewedBy =
      req.user._id;
    request.subscriptionExpiry =
      expiryDate;
    request.rejectionReason = "";

    await request.save();

    const updatedUser =
      await User.findById(user._id)
        .select("-password");

    return res.status(200).json({
      success: true,
      message:
        "Subscription approved successfully.",
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