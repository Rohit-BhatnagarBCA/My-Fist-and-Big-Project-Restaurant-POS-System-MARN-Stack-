const Dish = require("../models/dishModel");
const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

const addDish = async (req, res, next) => {
  try {
    const { name, price, category, quantity } = req.body;

    if (!name || !price || !category) {
      const error = createHttpError(400, "Please provide name, price and category!");
      return next(error);
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      const error = createHttpError(400, "Invalid category id!");
      return next(error);
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      const error = createHttpError(404, "Category not found!");
      return next(error);
    }

    const stockQty = Number(quantity) || 0;

    const newDish = new Dish({
      name,
      price,
      category,
      quantity: stockQty,
      isAvailable: stockQty > 0,
    });
    await newDish.save();

    res
      .status(201)
      .json({ success: true, message: "Dish added!", data: newDish });
  } catch (error) {
    next(error);
  }
};

const getDishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find().populate("category", "name icon bgColor");
    res.status(200).json({ success: true, data: dishes });
  } catch (error) {
    next(error);
  }
};

const updateDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAvailable, name, price, category, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid dish id!");
      return next(error);
    }

    if (category !== undefined && !mongoose.Types.ObjectId.isValid(category)) {
      const error = createHttpError(400, "Invalid category id!");
      return next(error);
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (price !== undefined) updateFields.price = price;
    if (category !== undefined) updateFields.category = category;

    if (quantity !== undefined) {
      const stockQty = Number(quantity) || 0;
      updateFields.quantity = stockQty;
      // Editing stock from the Add/Edit form auto-reflects availability.
      updateFields.isAvailable = stockQty > 0;
    }

    // The list's manual Switch sends isAvailable on its own (no quantity) —
    // that still works as an independent manual override.
    if (isAvailable !== undefined && quantity === undefined) {
      updateFields.isAvailable = isAvailable;
    }

    const dish = await Dish.findByIdAndUpdate(id, updateFields, {
      new: true,
    }).populate("category", "name icon bgColor");

    if (!dish) {
      const error = createHttpError(404, "Dish not found!");
      return next(error);
    }

    res.status(200).json({ success: true, message: "Dish updated!", data: dish });
  } catch (error) {
    next(error);
  }
};

const deleteDish = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid dish id!");
      return next(error);
    }

    const dish = await Dish.findByIdAndDelete(id);

    if (!dish) {
      const error = createHttpError(404, "Dish not found!");
      return next(error);
    }

    res.status(200).json({ success: true, message: "Dish deleted!" });
  } catch (error) {
    next(error);
  }
};

module.exports = { addDish, getDishes, updateDish, deleteDish };