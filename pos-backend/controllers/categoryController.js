const Category = require("../models/categoryModel");
const Dish = require("../models/dishModel");
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
// ADD CATEGORY
// ============================================================

const addCategory = async (
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
      icon,
      bgColor,
    } = req.body;

    if (
      !name ||
      !icon ||
      !bgColor
    ) {
      return next(
        createHttpError(
          400,
          "Please provide name, icon and color!"
        )
      );
    }

    const cleanName =
      String(name).trim();

    const existingCategory =
      await Category.findOne({
        restaurantId,
        name: cleanName,
      });

    if (existingCategory) {
      return next(
        createHttpError(
          400,
          "Category already exists in this restaurant!"
        )
      );
    }

    const newCategory =
      new Category({
        restaurantId,
        name: cleanName,
        icon,
        bgColor,
      });

    await newCategory.save();

    return res.status(201).json({
      success: true,
      message: "Category added!",
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET CATEGORIES
// ============================================================

const getCategories = async (
  req,
  res,
  next
) => {
  try {
    const restaurantId =
      requireRestaurant(req, next);

    if (!restaurantId) return;

    const categories =
      await Category.find({
        restaurantId,
      }).sort({
        name: 1,
      });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE CATEGORY
// ============================================================

const deleteCategory = async (
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
          "Invalid category id!"
        )
      );
    }

    const category =
      await Category.findOne({
        _id: id,
        restaurantId,
      });

    if (!category) {
      return next(
        createHttpError(
          404,
          "Category not found!"
        )
      );
    }

    // Delete only dishes belonging to this category
    // AND the same restaurant.
    await Dish.deleteMany({
      category: id,
      restaurantId,
    });

    await Category.deleteOne({
      _id: id,
      restaurantId,
    });

    return res.status(200).json({
      success: true,
      message:
        "Category and its dishes deleted!",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE CATEGORY
// ============================================================

const updateCategory = async (
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
      name,
      icon,
      bgColor,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return next(
        createHttpError(
          400,
          "Invalid category id!"
        )
      );
    }

    const category =
      await Category.findOne({
        _id: id,
        restaurantId,
      });

    if (!category) {
      return next(
        createHttpError(
          404,
          "Category not found!"
        )
      );
    }

    if (name !== undefined) {
      const cleanName =
        String(name).trim();

      const duplicate =
        await Category.findOne({
          restaurantId,
          name: cleanName,
          _id: {
            $ne: id,
          },
        });

      if (duplicate) {
        return next(
          createHttpError(
            400,
            "Category name already in use in this restaurant!"
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
      icon !== undefined
    ) {
      updateFields.icon =
        icon;
    }

    if (
      bgColor !== undefined
    ) {
      updateFields.bgColor =
        bgColor;
    }

    const updatedCategory =
      await Category.findOneAndUpdate(
        {
          _id: id,
          restaurantId,
        },
        updateFields,
        {
          new: true,
          runValidators: true,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Category updated!",
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory,
};