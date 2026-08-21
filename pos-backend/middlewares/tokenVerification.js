const createHttpError =
  require("http-errors");

const jwt =
  require("jsonwebtoken");

const config =
  require("../config/config");

const User =
  require("../models/userModel");

const Restaurant =
  require("../models/restaurantModel");

// ============================================================
// AUTHENTICATION
// ============================================================

const isVerifiedUser =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        accessToken,
      } = req.cookies;

      if (!accessToken) {
        return next(
          createHttpError(
            401,
            "Please provide token!"
          )
        );
      }

      const decoded =
        jwt.verify(
          accessToken,
          config.accessTokenSecret
        );

      const user =
        await User.findById(
          decoded._id
        )
          .populate(
            "restaurantId"
          );

      if (!user) {
        return next(
          createHttpError(
            401,
            "User does not exist!"
          )
        );
      }

      // ======================================================
      // AUTOMATIC RESTAURANT STATUS SYNC
      // ======================================================

      if (
        user.restaurantId
      ) {
        const restaurant =
          user.restaurantId;

        const startDate =
          restaurant
            .subscription
            ?.startDate;

        const expiryDate =
          restaurant
            .subscription
            ?.expiryDate;

        const now =
          new Date();

        let newStatus =
          restaurant.status;

        if (
          startDate &&
          expiryDate
        ) {
          const start =
            new Date(
              startDate
            );

          const expiry =
            new Date(
              expiryDate
            );

          if (
            now < start
          ) {
            newStatus =
              "pending";
          } else if (
            now >= start &&
            now < expiry
          ) {
            newStatus =
              "active";
          } else if (
            now >= expiry
          ) {
            newStatus =
              "expired";
          }

          if (
            newStatus !==
            restaurant.status
          ) {
            await Restaurant.updateOne(
              {
                _id:
                  restaurant._id,
              },
              {
                $set: {
                  status:
                    newStatus,
                },
              }
            );

            restaurant.status =
              newStatus;
          }
        }
      }

      req.user = user;

      next();
    } catch (error) {
      return next(
        createHttpError(
          401,
          "Invalid Token!"
        )
      );
    }
  };

// ============================================================
// ADMIN
// ============================================================

const isAdmin = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return next(
      createHttpError(
        401,
        "Authentication required!"
      )
    );
  }

  if (
    req.user.role !==
    "Admin"
  ) {
    return next(
      createHttpError(
        403,
        "Admin access required!"
      )
    );
  }

  next();
};

// ============================================================
// SUPER ADMIN
// ============================================================

const isSuperAdmin = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return next(
      createHttpError(
        401,
        "Authentication required!"
      )
    );
  }

  if (
    req.user.role !==
    "SuperAdmin"
  ) {
    return next(
      createHttpError(
        403,
        "Super Admin access required!"
      )
    );
  }

  next();
};

module.exports = {
  isVerifiedUser,
  isAdmin,
  isSuperAdmin,
};