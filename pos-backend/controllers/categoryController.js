const Category = require("../models/categoryModel");
const Dish = require("../models/dishModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

const addCategory = async (req, res, next) => {
  try {
    const { name, icon, bgColor } = req.body;

    if (!name || !icon || !bgColor) {
      const error = createHttpError(400, "Please provide name, icon and color!");
      return next(error);
    }

    const isCategoryPresent = await Category.findOne({ name });

    if (isCategoryPresent) {
      const error = createHttpError(400, "Category already exists!");
      return next(error);
    }

    const newCategory = new Category({ name, icon, bgColor });
    await newCategory.save();

    res
      .status(201)
      .json({ success: true, message: "Category added!", data: newCategory });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid category id!");
      return next(error);
    }

    const category = await Category.findById(id);
    if (!category) {
      const error = createHttpError(404, "Category not found!");
      return next(error);
    }

    // Cascade delete: remove all dishes that belong to this category too
    await Dish.deleteMany({ category: id });
    await Category.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Category deleted!" });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon, bgColor } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid category id!");
      return next(error);
    }

    if (name) {
      const duplicate = await Category.findOne({ name, _id: { $ne: id } });
      if (duplicate) {
        const error = createHttpError(400, "Category name already in use!");
        return next(error);
      }
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (icon !== undefined) updateFields.icon = icon;
    if (bgColor !== undefined) updateFields.bgColor = bgColor;

    const category = await Category.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!category) {
      const error = createHttpError(404, "Category not found!");
      return next(error);
    }

    res
      .status(200)
      .json({ success: true, message: "Category updated!", data: category });
  } catch (error) {
    next(error);
  }
};

module.exports = { addCategory, getCategories, deleteCategory, updateCategory };