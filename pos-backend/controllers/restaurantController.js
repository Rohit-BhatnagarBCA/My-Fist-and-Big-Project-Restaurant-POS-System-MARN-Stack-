const createHttpError = require("http-errors");

const Restaurant = require("../models/restaurantModel");
const User = require("../models/userModel");

// ============================================================
// CREATE RESTAURANT
// Admin creates his own restaurant.
// One Admin can own only one restaurant.
// ============================================================

const createRestaurant = async (
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

    if (req.user.role !== "Admin") {
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
      typeof name === "string"
        ? name.trim()
        : "";

    if (!restaurantName) {
      return next(
        createHttpError(
          400,
          "Restaurant name is required."
        )
      );
    }

    if (restaurantName.length > 120) {
      return next(
        createHttpError(
          400,
          "Restaurant name cannot exceed 120 characters."
        )
      );
    }

    // --------------------------------------------------------
    // Get fresh user from database.
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // If this Admin is already attached to a restaurant,
    // don't create another one.
    // --------------------------------------------------------

    if (user.restaurantId) {
      const existingRestaurant =
        await Restaurant.findById(
          user.restaurantId
        );

      if (existingRestaurant) {
        return next(
          createHttpError(
            400,
            "You are already linked to a restaurant."
          )
        );
      }

      // Stale restaurantId cleanup.
      user.restaurantId = null;
      await user.save();
    }

    // --------------------------------------------------------
    // Create restaurant.
    // --------------------------------------------------------

    const restaurant =
      await Restaurant.create({
        name: restaurantName,
        owner: user._id,
        status: "pending",
      });

    // --------------------------------------------------------
    // Attach restaurant to Admin.
    // --------------------------------------------------------

    try {
      user.restaurantId =
        restaurant._id;

      await user.save();
    } catch (error) {
      // Rollback restaurant if user update fails.
      await Restaurant.findByIdAndDelete(
        restaurant._id
      );

      throw error;
    }

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
        user: safeUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET MY RESTAURANT
// Admin can fetch only his own restaurant.
// ============================================================

const getMyRestaurant = async (
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

    if (req.user.role !== "Admin") {
      return next(
        createHttpError(
          403,
          "Only Admin accounts can access their restaurant."
        )
      );
    }

    if (!req.user.restaurantId) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const restaurant =
      await Restaurant.findOne({
        _id: req.user.restaurantId,
        owner: req.user._id,
      });

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
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE MY RESTAURANT NAME
// Admin can edit only his own restaurant.
// ============================================================

const updateMyRestaurant = async (
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

    if (req.user.role !== "Admin") {
      return next(
        createHttpError(
          403,
          "Only Admin accounts can update their restaurant."
        )
      );
    }

    if (!req.user.restaurantId) {
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
      typeof name === "string"
        ? name.trim()
        : "";

    if (!restaurantName) {
      return next(
        createHttpError(
          400,
          "Restaurant name is required."
        )
      );
    }

    if (restaurantName.length > 120) {
      return next(
        createHttpError(
          400,
          "Restaurant name cannot exceed 120 characters."
        )
      );
    }

    const restaurant =
      await Restaurant.findOneAndUpdate(
        {
          _id: req.user.restaurantId,
          owner: req.user._id,
        },
        {
          $set: {
            name: restaurantName,
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
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
};