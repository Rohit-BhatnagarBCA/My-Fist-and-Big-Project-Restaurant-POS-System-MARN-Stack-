const createHttpError =
  require("http-errors");

const Notification =
  require("../models/notificationModel");

const User =
  require("../models/userModel");

const Restaurant =
  require("../models/restaurantModel");

// ============================================================
// GET MY NOTIFICATIONS
// ============================================================

const getMyNotifications =
  async (
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

      const now =
        new Date();

      const notifications =
        await Notification.find({
          $or: [
            {
              recipientUserId:
                req.user._id,
            },
            {
              restaurantId:
                req.user.restaurantId,
              recipientUserId:
                null,
            },
          ],

          $and: [
            {
              $or: [
                {
                  expiresAt:
                    null,
                },
                {
                  expiresAt: {
                    $gt: now,
                  },
                },
              ],
            },
          ],
        })
          .populate(
            "senderUserId",
            "name email role"
          )
          .sort({
            createdAt:
              -1,
          })
          .limit(100);

      const unreadCount =
        await Notification.countDocuments({
          $or: [
            {
              recipientUserId:
                req.user._id,
            },
            {
              restaurantId:
                req.user.restaurantId,
              recipientUserId:
                null,
            },
          ],

          isRead:
            false,

          $or: [
            {
              expiresAt:
                null,
            },
            {
              expiresAt: {
                $gt: now,
              },
            },
          ],
        });

      // --------------------------------------------------------
      // CURRENT SUBSCRIPTION SUMMARY
      // --------------------------------------------------------

      let subscription =
        req.user.subscription ||
        null;

      let restaurant =
        null;

      if (
        req.user.restaurantId
      ) {
        restaurant =
          await Restaurant.findById(
            req.user.restaurantId
          ).select(
            "name status subscription"
          );

        if (
          restaurant?.subscription
        ) {
          subscription =
            restaurant.subscription;
        }
      }

      let daysUntilExpiry =
        null;

      if (
        subscription?.expiryDate
      ) {
        const diff =
          new Date(
            subscription.expiryDate
          ) -
          now;

        daysUntilExpiry =
          Math.ceil(
            diff /
              (1000 *
                60 *
                60 *
                24)
          );
      }

      return res.status(200).json({
        success: true,

        data: {
          notifications,

          unreadCount,

          subscription: {
            plan:
              subscription?.plan ||
              null,

            duration:
              subscription?.duration ||
              null,

            startDate:
              subscription?.startDate ||
              null,

            expiryDate:
              subscription?.expiryDate ||
              null,

            daysUntilExpiry,
          },

          restaurant: {
            name:
              restaurant?.name ||
              null,

            status:
              restaurant?.status ||
              null,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================

const markNotificationRead =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        id,
      } = req.params;

      const notification =
        await Notification.findOne(
          {
            _id: id,

            $or: [
              {
                recipientUserId:
                  req.user._id,
              },
              {
                restaurantId:
                  req.user
                    .restaurantId,
                recipientUserId:
                  null,
              },
            ],
          }
        );

      if (!notification) {
        return next(
          createHttpError(
            404,
            "Notification not found."
          )
        );
      }

      notification.isRead =
        true;

      await notification.save();

      return res.status(200).json({
        success: true,

        message:
          "Notification marked as read.",
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// MARK ALL AS READ
// ============================================================

const markAllNotificationsRead =
  async (
    req,
    res,
    next
  ) => {
    try {
      await Notification.updateMany(
        {
          $or: [
            {
              recipientUserId:
                req.user._id,
            },
            {
              restaurantId:
                req.user
                  .restaurantId,
              recipientUserId:
                null,
            },
          ],

          isRead:
            false,
        },
        {
          $set: {
            isRead:
              true,
          },
        }
      );

      return res.status(200).json({
        success: true,

        message:
          "All notifications marked as read.",
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// SUPER ADMIN — SEND MESSAGE
//
// targetType:
//   all
//   restaurant
//   user
// ============================================================

const sendNotification =
  async (
    req,
    res,
    next
  ) => {
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

      const {
        targetType,
        targetId,
        title,
        message,
        type = "announcement",
        expiresAt = null,
      } = req.body;

      if (
        !targetType ||
        !title?.trim() ||
        !message?.trim()
      ) {
        return next(
          createHttpError(
            400,
            "Target, title and message are required."
          )
        );
      }

      if (
        ![
          "all",
          "restaurant",
          "user",
        ].includes(
          targetType
        )
      ) {
        return next(
          createHttpError(
            400,
            "Invalid notification target."
          )
        );
      }

      if (
        ![
          "announcement",
          "subscription",
          "warning",
          "system",
        ].includes(type)
      ) {
        return next(
          createHttpError(
            400,
            "Invalid notification type."
          )
        );
      }

      let parsedExpiry =
        null;

      if (expiresAt) {
        parsedExpiry =
          new Date(
            expiresAt
          );

        if (
          Number.isNaN(
            parsedExpiry.getTime()
          )
        ) {
          return next(
            createHttpError(
              400,
              "Invalid expiry date."
            )
          );
        }
      }

      // ========================================================
      // SPECIFIC USER
      // ========================================================

      if (
        targetType ===
        "user"
      ) {
        const targetUser =
          await User.findById(
            targetId
          );

        if (!targetUser) {
          return next(
            createHttpError(
              404,
              "Target user not found."
            )
          );
        }

        const notification =
          await Notification.create(
            {
              recipientUserId:
                targetUser._id,

              restaurantId:
                targetUser.restaurantId ||
                null,

              senderUserId:
                req.user._id,

              title:
                title.trim(),

              message:
                message.trim(),

              type,

              expiresAt:
                parsedExpiry,
            }
          );

        return res.status(201).json({
          success: true,

          message:
            "Notification sent to the user.",

          count: 1,

          data:
            notification,
        });
      }

      // ========================================================
      // SPECIFIC RESTAURANT
      // ========================================================

      if (
        targetType ===
        "restaurant"
      ) {
        const restaurant =
          await Restaurant.findById(
            targetId
          );

        if (!restaurant) {
          return next(
            createHttpError(
              404,
              "Restaurant not found."
            )
          );
        }

        const notification =
          await Notification.create(
            {
              recipientUserId:
                null,

              restaurantId:
                restaurant._id,

              senderUserId:
                req.user._id,

              title:
                title.trim(),

              message:
                message.trim(),

              type,

              expiresAt:
                parsedExpiry,
            }
          );

        return res.status(201).json({
          success: true,

          message:
            "Notification sent to the restaurant.",

          count: 1,

          data:
            notification,
        });
      }

      // ========================================================
      // ALL USERS
      // ========================================================

      if (
        targetType ===
        "all"
      ) {
        const users =
          await User.find({
            role: {
              $ne:
                "SuperAdmin",
            },
          }).select(
            "_id restaurantId"
          );

        if (
          users.length ===
          0
        ) {
          return res.status(201).json({
            success: true,

            message:
              "No users available to notify.",

            count: 0,

            data: [],
          });
        }

        const documents =
          users.map(
            (user) => ({
              recipientUserId:
                user._id,

              restaurantId:
                user.restaurantId ||
                null,

              senderUserId:
                req.user._id,

              title:
                title.trim(),

              message:
                message.trim(),

              type,

              expiresAt:
                parsedExpiry,
            })
          );

        const created =
          await Notification.insertMany(
            documents
          );

        return res.status(201).json({
          success: true,

          message:
            "Notification sent to all users.",

          count:
            created.length,

          data:
            created,
        });
      }
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  sendNotification,
};