const Table = require("../models/tableModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

// ============================================================
// RESTAURANT HELPER
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

// ============================================================
// ADD TABLE
// ============================================================

const addTable = async (
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

    const {
      tableNo,
      seats,
    } = req.body;

    const cleanTableNo =
      Number(tableNo);

    const cleanSeats =
      Number(seats);

    if (
      !Number.isInteger(
        cleanTableNo
      ) ||
      cleanTableNo < 1
    ) {
      return next(
        createHttpError(
          400,
          "Table number must be a positive number."
        )
      );
    }

    if (
      !Number.isInteger(
        cleanSeats
      ) ||
      cleanSeats < 1
    ) {
      return next(
        createHttpError(
          400,
          "Number of seats must be at least 1."
        )
      );
    }

    const existingTable =
      await Table.findOne({
        restaurantId,
        tableNo:
          cleanTableNo,
      });

    if (existingTable) {
      return next(
        createHttpError(
          400,
          `Table ${cleanTableNo} already exists in this restaurant.`
        )
      );
    }

    const newTable =
      await Table.create({
        restaurantId,

        tableNo:
          cleanTableNo,

        seats:
          cleanSeats,

        status:
          "Available",

        currentOrder:
          null,
      });

    return res.status(201).json({
      success: true,
      message:
        "Table added!",
      data:
        newTable,
    });
  } catch (error) {
    // Mongo duplicate index fallback
    if (
      error?.code === 11000
    ) {
      return next(
        createHttpError(
          400,
          "This table number already exists in your restaurant."
        )
      );
    }

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
      requireRestaurant(
        req,
        next
      );

    if (!restaurantId) return;

    const tables =
      await Table.find({
        restaurantId,
      })
        .populate({
          path:
            "currentOrder",
          select:
            "customerDetails orderStatus orderType",
        })
        .sort({
          tableNo: 1,
        });

    return res.status(200).json({
      success: true,
      data:
        tables,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE TABLE
//
// Used for:
// 1. Admin edit: tableNo + seats
// 2. Order flow: status + orderId
// ============================================================

const updateTable = async (
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
          "Table not found in this restaurant!"
        )
      );
    }

    const {
      status,
      orderId,
      tableNo,
      seats,
    } = req.body;

    const updates = {};

    // --------------------------------------------------------
    // Table number
    // --------------------------------------------------------

    if (
      tableNo !== undefined
    ) {
      const cleanTableNo =
        Number(tableNo);

      if (
        !Number.isInteger(
          cleanTableNo
        ) ||
        cleanTableNo < 1
      ) {
        return next(
          createHttpError(
            400,
            "Table number must be a positive number."
          )
        );
      }

      const duplicate =
        await Table.findOne({
          restaurantId,
          tableNo:
            cleanTableNo,
          _id: {
            $ne: id,
          },
        });

      if (duplicate) {
        return next(
          createHttpError(
            400,
            `Table ${cleanTableNo} already exists in this restaurant.`
          )
        );
      }

      updates.tableNo =
        cleanTableNo;
    }

    // --------------------------------------------------------
    // Seats
    // --------------------------------------------------------

    if (
      seats !== undefined
    ) {
      const cleanSeats =
        Number(seats);

      if (
        !Number.isInteger(
          cleanSeats
        ) ||
        cleanSeats < 1
      ) {
        return next(
          createHttpError(
            400,
            "Number of seats must be at least 1."
          )
        );
      }

      updates.seats =
        cleanSeats;
    }

    // --------------------------------------------------------
    // Status
    // --------------------------------------------------------

    if (
      status !== undefined
    ) {
      if (
        ![
          "Available",
          "Booked",
        ].includes(status)
      ) {
        return next(
          createHttpError(
            400,
            "Invalid table status."
          )
        );
      }

      updates.status =
        status;
    }

    // --------------------------------------------------------
    // Current order
    // --------------------------------------------------------

    if (
      orderId !== undefined
    ) {
      if (
        orderId !== null &&
        !mongoose.Types.ObjectId.isValid(
          orderId
        )
      ) {
        return next(
          createHttpError(
            400,
            "Invalid order id."
          )
        );
      }

      updates.currentOrder =
        orderId;
    }

    if (
      Object.keys(
        updates
      ).length === 0
    ) {
      return next(
        createHttpError(
          400,
          "No table changes provided."
        )
      );
    }

    const updatedTable =
      await Table.findOneAndUpdate(
        {
          _id: id,
          restaurantId,
        },
        {
          $set:
            updates,
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate({
        path:
          "currentOrder",
        select:
          "customerDetails orderStatus orderType",
      });

    return res.status(200).json({
      success: true,
      message:
        "Table updated!",
      data:
        updatedTable,
    });
  } catch (error) {
    if (
      error?.code === 11000
    ) {
      return next(
        createHttpError(
          400,
          "This table number already exists in your restaurant."
        )
      );
    }

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
      requireRestaurant(
        req,
        next
      );

    if (!restaurantId) return;

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
      table.status ===
      "Booked"
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
      message:
        "Table deleted!",
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