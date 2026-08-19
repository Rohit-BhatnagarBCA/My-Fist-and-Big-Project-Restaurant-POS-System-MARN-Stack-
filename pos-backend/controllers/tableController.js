const Table = require("../models/tableModel");
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
// ADD TABLE
// ============================================================

const addTable = async (req, res, next) => {
  try {
    const restaurantId =
      requireRestaurant(req, next);

    if (!restaurantId) return;

    const { tableNo, seats } = req.body;

    if (
      tableNo === undefined ||
      tableNo === null ||
      tableNo === ""
    ) {
      return next(
        createHttpError(
          400,
          "Please provide table No!"
        )
      );
    }

    if (
      seats === undefined ||
      seats === null ||
      seats === ""
    ) {
      return next(
        createHttpError(
          400,
          "Please provide number of seats!"
        )
      );
    }

    const existingTable =
      await Table.findOne({
        restaurantId,
        tableNo,
      });

    if (existingTable) {
      return next(
        createHttpError(
          400,
          "Table already exists in this restaurant!"
        )
      );
    }

    const newTable =
      new Table({
        restaurantId,
        tableNo,
        seats,
      });

    await newTable.save();

    return res.status(201).json({
      success: true,
      message: "Table added!",
      data: newTable,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET TABLES
// ============================================================

const getTables = async (
  req,
  res,
  next
) => {
  try {
    const restaurantId =
      requireRestaurant(req, next);

    if (!restaurantId) return;

    const tables =
      await Table.find({
        restaurantId,
      })
        .populate({
          path: "currentOrder",
          select: "customerDetails",
        })
        .sort({ tableNo: 1 });

    return res.status(200).json({
      success: true,
      data: tables,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE TABLE
// ============================================================

const updateTable = async (
  req,
  res,
  next
) => {
  try {
    const restaurantId =
      requireRestaurant(req, next);

    if (!restaurantId) return;

    const {
      status,
      orderId,
      tableNo,
      seats,
    } = req.body;

    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return next(
        createHttpError(
          400,
          "Invalid table id!"
        )
      );
    }

    // --------------------------------------------------------
    // Make sure this table belongs to the logged-in restaurant.
    // --------------------------------------------------------

    const existingTable =
      await Table.findOne({
        _id: id,
        restaurantId,
      });

    if (!existingTable) {
      return next(
        createHttpError(
          404,
          "Table not found!"
        )
      );
    }

    // --------------------------------------------------------
    // Prevent duplicate table numbers inside same restaurant.
    // --------------------------------------------------------

    if (
      tableNo !== undefined &&
      Number(tableNo) !==
        Number(existingTable.tableNo)
    ) {
      const duplicateTable =
        await Table.findOne({
          restaurantId,
          tableNo,
          _id: {
            $ne: id,
          },
        });

      if (duplicateTable) {
        return next(
          createHttpError(
            400,
            "Another table with this number already exists in this restaurant!"
          )
        );
      }
    }

    const updateFields = {};

    if (
      status !== undefined
    ) {
      updateFields.status =
        status;
    }

    if (
      orderId !== undefined
    ) {
      updateFields.currentOrder =
        orderId || null;
    }

    if (
      tableNo !== undefined
    ) {
      updateFields.tableNo =
        tableNo;
    }

    if (
      seats !== undefined
    ) {
      updateFields.seats =
        seats;
    }

    const table =
      await Table.findOneAndUpdate(
        {
          _id: id,
          restaurantId,
        },
        updateFields,
        {
          new: true,
          runValidators: true,
        }
      ).populate({
        path: "currentOrder",
        select: "customerDetails",
      });

    if (!table) {
      return next(
        createHttpError(
          404,
          "Table not found!"
        )
      );
    }

    return res.status(200).json({
      success: true,
      message: "Table updated!",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE TABLE
// ============================================================

const deleteTable = async (
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
          "Invalid table id!"
        )
      );
    }

    const table =
      await Table.findOne({
        _id: id,
        restaurantId,
      });

    if (!table) {
      return next(
        createHttpError(
          404,
          "Table not found!"
        )
      );
    }

    if (
      table.status === "Booked"
    ) {
      return next(
        createHttpError(
          400,
          "Cannot delete a table that is currently booked!"
        )
      );
    }

    await Table.deleteOne({
      _id: id,
      restaurantId,
    });

    return res.status(200).json({
      success: true,
      message: "Table deleted!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTable,
  getTables,
  updateTable,
  deleteTable,
};