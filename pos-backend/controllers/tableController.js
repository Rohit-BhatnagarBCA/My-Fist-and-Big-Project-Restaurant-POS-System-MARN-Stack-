const Table = require("../models/tableModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose")

const addTable = async (req, res, next) => {
  try {
    const { tableNo, seats } = req.body;
    if (!tableNo) {
      const error = createHttpError(400, "Please provide table No!");
      return next(error);
    }
    const isTablePresent = await Table.findOne({ tableNo });

    if (isTablePresent) {
      const error = createHttpError(400, "Table already exist!");
      return next(error);
    }

    const newTable = new Table({ tableNo, seats });
    await newTable.save();
    res
      .status(201)
      .json({ success: true, message: "Table added!", data: newTable });
  } catch (error) {
    next(error);
  }
};

const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().populate({
      path: "currentOrder",
      select: "customerDetails"
    });
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    // Supports two use-cases with the same endpoint, matching existing
    // callers: the order flow sends { status, orderId }, while the admin
    // edit form sends { tableNo, seats }. Only the fields actually present
    // in the body get updated, so neither caller breaks the other.
    const { status, orderId, tableNo, seats } = req.body;

    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        const error = createHttpError(404, "Invalid id!");
        return next(error);
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (orderId !== undefined) updateFields.currentOrder = orderId;
    if (tableNo !== undefined) updateFields.tableNo = tableNo;
    if (seats !== undefined) updateFields.seats = seats;

    const table = await Table.findByIdAndUpdate(
        id,
      updateFields,
      { new: true }
    );

    if (!table) {
      const error = createHttpError(404, "Table not found!");
      return next(error);
    }

    res.status(200).json({success: true, message: "Table updated!", data: table});

  } catch (error) {
    next(error);
  }
};

const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const table = await Table.findById(id);
    if (!table) {
      const error = createHttpError(404, "Table not found!");
      return next(error);
    }

    if (table.status === "Booked") {
      const error = createHttpError(
        400,
        "Cannot delete a table that is currently booked!"
      );
      return next(error);
    }

    await Table.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Table deleted!" });
  } catch (error) {
    next(error);
  }
};

module.exports = { addTable, getTables, updateTable, deleteTable };