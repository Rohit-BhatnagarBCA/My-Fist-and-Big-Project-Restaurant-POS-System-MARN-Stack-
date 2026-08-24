const Dish = require("../models/dishModel");
const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

// ============================================================
// HELPER
// ============================================================

const requireRestaurant = (
  req,
  next
) => {
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

const isKitchenOrAdmin = (
  req
) => {
  return (
    req.user?.role === "Kitchen" ||
    req.user?.role === "Admin"
  );
};

// ============================================================
// ADD DISH
// ADMIN ONLY
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

    if (
      req.user?.role !== "Admin"
    ) {
      return next(
        createHttpError(
          403,
          "Admin access required!"
        )
      );
    }

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

        quantity:
          stockQty,

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
      message:
        "Dish added!",
      data:
        populatedDish,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET DISHES
// AUTHENTICATED RESTAURANT USERS
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
      })
        .populate(
          "category",
          "name icon bgColor"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      data:
        dishes,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE DISH
// ADMIN ONLY
//
// Full dish editing:
// name
// price
// category
// quantity
// isAvailable
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

    if (
      req.user?.role !== "Admin"
    ) {
      return next(
        createHttpError(
          403,
          "Admin access required!"
        )
      );
    }

    const {
      id,
    } = req.params;

    const {
      isAvailable,
      name,
      price,
      category,
      quantity,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
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
    // CATEGORY CHECK
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
      const cleanName =
        String(name).trim();

      if (!cleanName) {
        return next(
          createHttpError(
            400,
            "Dish name cannot be empty!"
          )
        );
      }

      updateFields.name =
        cleanName;
    }

    if (
      price !== undefined
    ) {
      const numericPrice =
        Number(price);

      if (
        Number.isNaN(
          numericPrice
        ) ||
        numericPrice < 0
      ) {
        return next(
          createHttpError(
            400,
            "Invalid dish price!"
          )
        );
      }

      updateFields.price =
        numericPrice;
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
        Number(quantity);

      if (
        Number.isNaN(stockQty) ||
        stockQty < 0
      ) {
        return next(
          createHttpError(
            400,
            "Stock quantity cannot be negative!"
          )
        );
      }

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
        Boolean(
          isAvailable
        );
    }

    if (
      Object.keys(
        updateFields
      ).length === 0
    ) {
      return next(
        createHttpError(
          400,
          "No dish changes provided!"
        )
      );
    }

    const dish =
      await Dish.findOneAndUpdate(
        {
          _id: id,
          restaurantId,
        },
        {
          $set:
            updateFields,
        },
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
      message:
        "Dish updated!",
      data:
        dish,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// KITCHEN — UPDATE STOCK ONLY
//
// Kitchen can ONLY change:
// quantity
// isAvailable
//
// Cannot change:
// name
// price
// category
// ============================================================

const updateDishStock =
  async (
    req,
    res,
    next
  ) => {
    try {
      const restaurantId =
        requireRestaurant(
          req,
          next
        );

      if (!restaurantId) return;

      if (
        !isKitchenOrAdmin(req)
      ) {
        return next(
          createHttpError(
            403,
            "Only Kitchen or Admin can update stock!"
          )
        );
      }

      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return next(
          createHttpError(
            400,
            "Invalid dish id!"
          )
        );
      }

      const {
        quantity,
        isAvailable,
      } = req.body;

      if (
        quantity === undefined &&
        isAvailable === undefined
      ) {
        return next(
          createHttpError(
            400,
            "Provide quantity or stock availability!"
          )
        );
      }

      const dish =
        await Dish.findOne({
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

      const updateFields =
        {};

      // --------------------------------------------------------
      // QUANTITY
      // --------------------------------------------------------

      if (
        quantity !== undefined
      ) {
        const nextQuantity =
          Number(quantity);

        if (
          !Number.isInteger(
            nextQuantity
          ) ||
          nextQuantity < 0
        ) {
          return next(
            createHttpError(
              400,
              "Stock quantity must be a whole number greater than or equal to 0."
            )
          );
        }

        updateFields.quantity =
          nextQuantity;

        // Quantity = 0 automatically means unavailable.
        if (
          nextQuantity === 0
        ) {
          updateFields.isAvailable =
            false;
        } else if (
          isAvailable === undefined
        ) {
          updateFields.isAvailable =
            true;
        }
      }

      // --------------------------------------------------------
      // AVAILABILITY
      // --------------------------------------------------------

      if (
        isAvailable !== undefined
      ) {
        updateFields.isAvailable =
          Boolean(
            isAvailable
          );
      }

      const updatedDish =
        await Dish.findOneAndUpdate(
          {
            _id: id,
            restaurantId,
          },
          {
            $set:
              updateFields,
          },
          {
            new: true,
            runValidators: true,
          }
        ).populate(
          "category",
          "name icon bgColor"
        );

      if (!updatedDish) {
        return next(
          createHttpError(
            404,
            "Dish not found!"
          )
        );
      }

      return res.status(200).json({
        success: true,
        message:
          "Stock updated successfully!",
        data:
          updatedDish,
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// DELETE DISH
// ADMIN ONLY
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

    if (
      req.user?.role !== "Admin"
    ) {
      return next(
        createHttpError(
          403,
          "Admin access required!"
        )
      );
    }

    const {
      id,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
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
      message:
        "Dish deleted!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addDish,
  getDishes,
  updateDish,
  updateDishStock,
  deleteDish,
};