const createHttpError = require("http-errors");

const Restaurant =
  require("../models/restaurantModel");

const User =
  require("../models/userModel");

const Order =
  require("../models/orderModel");

const Table =
  require("../models/tableModel");

const Dish =
  require("../models/dishModel");

const Category =
  require("../models/categoryModel");

// ============================================================
// CREATE RESTAURANT
// ============================================================

const createRestaurant =
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
            "Only Admin accounts can create a restaurant."
          )
        );
      }

      const {
        name,
      } = req.body;

      const restaurantName =
        typeof name ===
        "string"
          ? name.trim()
          : "";

      if (
        !restaurantName
      ) {
        return next(
          createHttpError(
            400,
            "Restaurant name is required."
          )
        );
      }

      if (
        restaurantName.length >
        120
      ) {
        return next(
          createHttpError(
            400,
            "Restaurant name cannot exceed 120 characters."
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

      if (
        user.restaurantId
      ) {
        const existing =
          await Restaurant.findById(
            user.restaurantId
          );

        if (existing) {
          return next(
            createHttpError(
              400,
              "You are already linked to a restaurant."
            )
          );
        }
      }

      const restaurant =
        await Restaurant.create(
          {
            name:
              restaurantName,
            owner:
              user._id,
            status:
              "pending",
          }
        );

      await User.updateOne(
        {
          _id: user._id,
        },
        {
          $set: {
            restaurantId:
              restaurant._id,
          },
        }
      );

      const safeUser =
        await User.findById(
          user._id
        ).select(
          "-password"
        );

      return res.status(201).json({
        success: true,
        message:
          "Restaurant created and linked successfully.",
        data: {
          restaurant,
          user:
            safeUser,
        },
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// ADMIN — GET MY RESTAURANT
// ============================================================

const getMyRestaurant =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        req.user?.role !==
        "Admin"
      ) {
        return next(
          createHttpError(
            403,
            "Only Admin accounts can access their restaurant."
          )
        );
      }

      if (
        !req.user.restaurantId
      ) {
        return res.status(200).json({
          success: true,
          data: null,
        });
      }

      const restaurant =
        await Restaurant.findOne(
          {
            _id:
              req.user.restaurantId,
            owner:
              req.user._id,
          }
        );

      if (!restaurant) {
        return next(
          createHttpError(
            404,
            "Restaurant not found."
          )
        );
      }

      return res.status(200).json({
        success: true,
        data:
          restaurant,
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// ADMIN — UPDATE RESTAURANT
// ============================================================

const updateMyRestaurant =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        req.user?.role !==
        "Admin"
      ) {
        return next(
          createHttpError(
            403,
            "Only Admin accounts can update their restaurant."
          )
        );
      }

      if (
        !req.user.restaurantId
      ) {
        return next(
          createHttpError(
            404,
            "You are not linked to a restaurant yet."
          )
        );
      }

      const {
        name,
      } = req.body;

      const restaurantName =
        typeof name ===
        "string"
          ? name.trim()
          : "";

      if (
        !restaurantName
      ) {
        return next(
          createHttpError(
            400,
            "Restaurant name is required."
          )
        );
      }

      const restaurant =
        await Restaurant.findOneAndUpdate(
          {
            _id:
              req.user.restaurantId,
            owner:
              req.user._id,
          },
          {
            $set: {
              name:
                restaurantName,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!restaurant) {
        return next(
          createHttpError(
            404,
            "Restaurant not found."
          )
        );
      }

      return res.status(200).json({
        success: true,
        message:
          "Restaurant updated successfully.",
        data:
          restaurant,
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// SUPER ADMIN — GET ALL RESTAURANTS
// ============================================================

const getAllRestaurants =
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

      const restaurants =
        await Restaurant.find()
          .populate(
            "owner",
            "name email phone role"
          )
          .sort({
            createdAt: -1,
          });

      const restaurantIds =
        restaurants.map(
          (restaurant) =>
            restaurant._id
        );

      const staffCounts =
        await User.aggregate([
          {
            $match: {
              restaurantId: {
                $in:
                  restaurantIds,
              },

              role: {
                $in: [
                  "Admin",
                  "Waiter",
                  "Kitchen",
                ],
              },
            },
          },

          {
            $group: {
              _id:
                "$restaurantId",

              total: {
                $sum: 1,
              },

              admins: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$role",
                        "Admin",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              waiters: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$role",
                        "Waiter",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              kitchen: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$role",
                        "Kitchen",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]);

      const countMap =
        new Map(
          staffCounts.map(
            (item) => [
              item._id.toString(),
              item,
            ]
          )
        );

      const data =
        restaurants.map(
          (restaurant) => {
            const counts =
              countMap.get(
                restaurant._id.toString()
              ) || {
                total: 0,
                admins: 0,
                waiters: 0,
                kitchen: 0,
              };

            return {
              ...restaurant.toObject(),

              staff: {
                total:
                  counts.total,

                admins:
                  counts.admins,

                waiters:
                  counts.waiters,

                kitchen:
                  counts.kitchen,
              },
            };
          }
        );

      return res.status(200).json({
        success: true,
        count:
          data.length,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// SUPER ADMIN — GET RESTAURANT DETAILS
// ============================================================

const getRestaurantById =
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
        id,
      } = req.params;

      if (
        !/^[0-9a-fA-F]{24}$/.test(
          id
        )
      ) {
        return next(
          createHttpError(
            400,
            "Invalid restaurant ID."
          )
        );
      }

      const restaurant =
        await Restaurant.findById(
          id
        ).populate(
          "owner",
          "name email phone role"
        );

      if (!restaurant) {
        return next(
          createHttpError(
            404,
            "Restaurant not found."
          )
        );
      }

      const users =
        await User.find({
          restaurantId:
            restaurant._id,
        })
          .select(
            "-password"
          )
          .sort({
            createdAt: -1,
          });

      const [
        tableCount,
        categoryCount,
        dishCount,
        orderCount,
      ] = await Promise.all([
        Table.countDocuments({
          restaurantId:
            restaurant._id,
        }),

        Category.countDocuments({
          restaurantId:
            restaurant._id,
        }),

        Dish.countDocuments({
          restaurantId:
            restaurant._id,
        }),

        Order.countDocuments({
          restaurantId:
            restaurant._id,
        }),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          restaurant,

          owner:
            restaurant.owner,

          users,

          counts: {
            totalUsers:
              users.length,

            admins:
              users.filter(
                (user) =>
                  user.role ===
                  "Admin"
              ).length,

            waiters:
              users.filter(
                (user) =>
                  user.role ===
                  "Waiter"
              ).length,

            kitchen:
              users.filter(
                (user) =>
                  user.role ===
                  "Kitchen"
              ).length,

            tables:
              tableCount,

            categories:
              categoryCount,

            dishes:
              dishCount,

            orders:
              orderCount,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// SUPER ADMIN — UPDATE RESTAURANT STATUS
// ============================================================

const updateRestaurantStatus =
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
        id,
      } = req.params;

      const {
        status,
      } = req.body;

      const allowedStatuses = [
        "pending",
        "active",
        "suspended",
        "expired",
      ];

      if (
        !/^[0-9a-fA-F]{24}$/.test(
          id
        )
      ) {
        return next(
          createHttpError(
            400,
            "Invalid restaurant ID."
          )
        );
      }

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return next(
          createHttpError(
            400,
            "Invalid restaurant status."
          )
        );
      }

      const restaurant =
        await Restaurant.findByIdAndUpdate(
          id,
          {
            $set: {
              status,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!restaurant) {
        return next(
          createHttpError(
            404,
            "Restaurant not found."
          )
        );
      }

      return res.status(200).json({
        success: true,
        message:
          `Restaurant status changed to ${status}.`,
        data:
          restaurant,
      });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,

  getAllRestaurants,
  getRestaurantById,
  updateRestaurantStatus,
};