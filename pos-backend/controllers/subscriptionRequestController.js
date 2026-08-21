const createHttpError = require("http-errors");
const mongoose = require("mongoose");

const SubscriptionRequest =
  require("../models/subscriptionRequestModel");

const User =
  require("../models/userModel");

const Restaurant =
  require("../models/restaurantModel");

const {
  BUSINESS_PLANS,
  calculateAmount,
} = require("../config/pricing");

// ============================================================
// CREATE REQUEST
// ============================================================

const createSubscriptionRequest =
  async (req, res, next) => {
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

      if (
        !BUSINESS_PLANS[plan].prices?.[duration]
      ) {
        return next(
          createHttpError(
            400,
            "Invalid subscription duration."
          )
        );
      }

      const user =
        await User.findById(
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

      if (user.role !== "Admin") {
        return next(
          createHttpError(
            403,
            "Only restaurant Admins can purchase a business subscription."
          )
        );
      }

      if (!user.restaurantId) {
        return next(
          createHttpError(
            403,
            "Your account is not linked to a restaurant."
          )
        );
      }

      const restaurant =
        await Restaurant.findById(
          user.restaurantId
        );

      if (!restaurant) {
        return next(
          createHttpError(
            404,
            "Restaurant not found."
          )
        );
      }

      const pendingRequest =
        await SubscriptionRequest.findOne({
          restaurantId:
            restaurant._id,
          status: "Pending",
        });

      if (pendingRequest) {
        return next(
          createHttpError(
            400,
            "This restaurant already has a pending subscription request."
          )
        );
      }

      const amount =
        calculateAmount({
          role: "Admin",
          plan,
          duration,
          isLinkedToAdmin: false,
        });

      const request =
        await SubscriptionRequest.create({
          restaurantId:
            restaurant._id,

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
          "Subscription request submitted successfully.",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// MY REQUESTS
// ============================================================

const getMySubscriptionRequests =
  async (req, res, next) => {
    try {
      if (!req.user?._id) {
        return next(
          createHttpError(
            401,
            "Authentication required."
          )
        );
      }

      const user =
        await User.findById(
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

      if (!user.restaurantId) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      const requests =
        await SubscriptionRequest.find({
          restaurantId:
            user.restaurantId,
        })
          .sort({
            createdAt: -1,
          })
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
// SUPER ADMIN — ALL REQUESTS
// ============================================================

const getAllSubscriptionRequests =
  async (req, res, next) => {
    try {
      if (
        req.user?.role !==
        "SuperAdmin"
      ) {
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
            "restaurantId",
            "name status subscription owner"
          )
          .populate(
            "user",
            "name email phone role restaurantId"
          )
          .populate(
            "reviewedBy",
            "name email role"
          )
          .sort({
            createdAt: -1,
          })
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
// SUPER ADMIN — REVIEW
//
// APPROVED request now needs:
// startDate
// startTime
// expiryDate
// expiryTime
// ============================================================

const reviewSubscriptionRequest =
  async (req, res, next) => {
    try {
      if (
        req.user?.role !==
        "SuperAdmin"
      ) {
        return next(
          createHttpError(
            403,
            "Super Admin access required."
          )
        );
      }

      const { id } =
        req.params;

      const {
        status,
        rejectionReason,

        startDate,
        startTime,

        expiryDate,
        expiryTime,
      } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
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
            "Status must be Approved or Rejected."
          )
        );
      }

      const request =
        await SubscriptionRequest.findById(
          id
        );

      if (!request) {
        return next(
          createHttpError(
            404,
            "Subscription request not found."
          )
        );
      }

      if (
        request.status !==
        "Pending"
      ) {
        return next(
          createHttpError(
            400,
            "This request has already been reviewed."
          )
        );
      }

      const restaurant =
        await Restaurant.findById(
          request.restaurantId
        );

      if (!restaurant) {
        return next(
          createHttpError(
            404,
            "Restaurant not found."
          )
        );
      }

      const user =
        await User.findById(
          request.user
        );

      if (!user) {
        return next(
          createHttpError(
            404,
            "Associated Admin not found."
          )
        );
      }

      // ======================================================
      // REJECT
      // ======================================================

      if (
        status === "Rejected"
      ) {
        request.status =
          "Rejected";

        request.reviewedAt =
          new Date();

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

      // ======================================================
      // APPROVE VALIDATION
      // ======================================================

      if (
        !startDate ||
        !startTime ||
        !expiryDate ||
        !expiryTime
      ) {
        return next(
          createHttpError(
            400,
            "Start date/time and expiry date/time are required."
          )
        );
      }

      const parsedStart =
        new Date(
          `${startDate}T${startTime}`
        );

      const parsedExpiry =
        new Date(
          `${expiryDate}T${expiryTime}`
        );

      if (
        Number.isNaN(
          parsedStart.getTime()
        ) ||
        Number.isNaN(
          parsedExpiry.getTime()
        )
      ) {
        return next(
          createHttpError(
            400,
            "Invalid subscription date or time."
          )
        );
      }

      if (
        parsedExpiry <=
        parsedStart
      ) {
        return next(
          createHttpError(
            400,
            "Expiry must be later than start time."
          )
        );
      }

      const expectedAmount =
        calculateAmount({
          role: "Admin",
          plan: request.plan,
          duration:
            request.duration,
          isLinkedToAdmin: false,
        });

      if (
        Number(request.amount) !==
        Number(expectedAmount)
      ) {
        return next(
          createHttpError(
            400,
            "Subscription amount mismatch."
          )
        );
      }

      // ======================================================
      // DETERMINE INITIAL STATUS
      // ======================================================

      const now =
        new Date();

      let restaurantStatus =
        "pending";

      if (
        now >= parsedStart &&
        now < parsedExpiry
      ) {
        restaurantStatus =
          "active";
      } else if (
        now >= parsedExpiry
      ) {
        restaurantStatus =
          "expired";
      }

      // ======================================================
      // RESTAURANT = SOURCE OF TRUTH
      // ======================================================

      const updatedRestaurant =
        await Restaurant.findByIdAndUpdate(
          restaurant._id,
          {
            $set: {
              status:
                restaurantStatus,

              subscription: {
                plan:
                  request.plan,

                duration:
                  request.duration,

                amountPaid:
                  request.amount,

                startDate:
                  parsedStart,

                expiryDate:
                  parsedExpiry,
              },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      // ======================================================
      // USER SUBSCRIPTION MIRROR
      // ======================================================

      await User.updateOne(
        {
          _id: user._id,
        },
        {
          $set: {
            restaurantId:
              restaurant._id,

            subscription: {
              plan:
                request.plan,

              duration:
                request.duration,

              amountPaid:
                request.amount,

              startDate:
                parsedStart,

              expiryDate:
                parsedExpiry,

              linkedAdminEmail:
                null,
            },
          },
        }
      );

      // ======================================================
      // UPDATE REQUEST
      // ======================================================

      request.status =
        "Approved";

      request.reviewedAt =
        now;

      request.reviewedBy =
        req.user._id;

      request.subscriptionExpiry =
        parsedExpiry;

      request.rejectionReason =
        "";

      await request.save();

      return res.status(200).json({
        success: true,
        message:
          "Restaurant subscription activated successfully.",
        data: {
          request,
          restaurant:
            updatedRestaurant,
          userId:
            user._id,
        },
      });
    } catch (error) {
      console.error(
        "SUBSCRIPTION REVIEW ERROR:",
        error
      );

      next(error);
    }
  };

module.exports = {
  createSubscriptionRequest,
  getMySubscriptionRequests,
  getAllSubscriptionRequests,
  reviewSubscriptionRequest,
};