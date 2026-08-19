const Dish = require("../models/dishModel");
const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

// ============================================================
// HELPER
// ============================================================

const requireRestaurant = (req, next) => {
  if (!req.user?.restaurantId) {
    next(
      createHttpError(
        403,
        "Your account is not linked to a restaurant."
      )
    );

    return null;
  }

  return req.user.restaurantId;
};

// ============================================================
// ADD DISH
// ============================================================

const addDish = async (
  req,
  res,
  next
) => {
  try {
    const restaurantId =
      requireRestaurant(req, next);

    if (!restaurantId) return;

    const {
      name,
      price,
      category,
      quantity,
    } = req.body;

    if (
      !name ||
      price === undefined ||
      price === null ||
      !category
    ) {
      return next(
        createHttpError(
          400,
          "Please provide name, price and category!"
        )
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        category
      )
    ) {
      return next(
        createHttpError(
          400,
          "Invalid category id!"
        )
      );
    }

    // --------------------------------------------------------
    // Category MUST belong to same restaurant.
    // --------------------------------------------------------

    const categoryExists =
      await Category.findOne({
        _id: category,
        restaurantId,
      });

    if (!categoryExists) {
      return next(
        createHttpError(
          404,
          "Category not found in this restaurant!"
        )
      );
    }

    const stockQty =
      Number(quantity) || 0;

    const newDish =
      new Dish({
        restaurantId,
        name:
          String(name).trim(),
        price,
        category,
        quantity: stockQty,
        isAvailable:
          stockQty > 0,
      });

    await newDish.save();

    const populatedDish =
      await newDish.populate(
        "category",
        "name icon bgColor"
      );

    return res.status(201).json({
      success: true,
      message: "Dish added!",
      data: populatedDish,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET DISHES
// ============================================================

const getDishes = async (
  req,
  res,
  next
) => {
  try {
    const restaurantId =
      requireRestaurant(req, next);

    if (!restaurantId) return;

    const dishes =
      await Dish.find({
        restaurantId,
      }).populate(
        "category",
        "name icon bgColor"
      );

    return res.status(200).json({
      success: true,
      data: dishes,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE DISH
// ============================================================

const updateDish = async (
  req,
  res,
  next
) => {
  try {
    const restaurantId =
      requireRestaurant(req, next);

    if (!restaurantId) return;

    const { id } =
      req.params;

    const {
      isAvailable,
      name,
      price,
      category,
      quantity,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return next(
        createHttpError(
          400,
          "Invalid dish id!"
        )
      );
    }

    const existingDish =
      await Dish.findOne({
        _id: id,
        restaurantId,
      });

    if (!existingDish) {
      return next(
        createHttpError(
          404,
          "Dish not found!"
        )
      );
    }

    // --------------------------------------------------------
    // If category changes, new category must belong
    // to the same restaurant.
    // --------------------------------------------------------

    if (
      category !== undefined
    ) {
      if (
        !mongoose.Types.ObjectId.isValid(
          category
        )
      ) {
        return next(
          createHttpError(
            400,
            "Invalid category id!"
          )
        );
      }

      const categoryExists =
        await Category.findOne({
          _id: category,
          restaurantId,
        });

      if (!categoryExists) {
        return next(
          createHttpError(
            404,
            "Category not found in this restaurant!"
          )
        );
      }
    }

    const updateFields = {};

    if (
      name !== undefined
    ) {
      updateFields.name =
        String(name).trim();
    }

    if (
      price !== undefined
    ) {
      updateFields.price =
        price;
    }

    if (
      category !== undefined
    ) {
      updateFields.category =
        category;
    }

    if (
      quantity !== undefined
    ) {
      const stockQty =
        Number(quantity) || 0;

      updateFields.quantity =
        stockQty;

      updateFields.isAvailable =
        stockQty > 0;
    }

    if (
      isAvailable !== undefined &&
      quantity === undefined
    ) {
      updateFields.isAvailable =
        isAvailable;
    }

    const dish =
      await Dish.findOneAndUpdate(
        {
          _id: id,
          restaurantId,
        },
        updateFields,
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "category",
        "name icon bgColor"
      );

    if (!dish) {
      return next(
        createHttpError(
          404,
          "Dish not found!"
        )
      );
    }

    return res.status(200).json({
      success: true,
      message: "Dish updated!",
      data: dish,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE DISH
// ============================================================

const deleteDish = async (
  req,
  res,
  next
) => {
  try {
    const restaurantId =
      requireRestaurant(req, next);

    if (!restaurantId) return;

    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return next(
        createHttpError(
          400,
          "Invalid dish id!"
        )
      );
    }

    const dish =
      await Dish.findOneAndDelete({
        _id: id,
        restaurantId,
      });

    if (!dish) {
      return next(
        createHttpError(
          404,
          "Dish not found!"
        )
      );
    }

    return res.status(200).json({
      success: true,
      message: "Dish deleted!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addDish,
  getDishes,
  updateDish,
  deleteDish,
};