const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Dish = require("../models/dishModel");
const { default: mongoose } = require("mongoose");

// Tax rate must stay in sync with
// pos-frontend/src/components/menu/Bill.jsx
const TAX_RATE = 5.25;

// Only these payment methods are allowed.
// Online means manual QR/UPI payment.
// There is no Razorpay payment gateway anymore.
const ALLOWED_PAYMENT_METHODS = ["Cash", "Online"];

// Shared by addOrder and addItemsToOrder:
// deducts stock for each item when the dish has an explicit stock quantity.
const adjustItemsForStock = async (items) => {
  const stockAdjustments = [];
  const adjustedItems = [];

  for (const item of items) {
    // No valid dish reference — pass the item through unchanged.
    if (!item.dishId || !mongoose.Types.ObjectId.isValid(item.dishId)) {
      adjustedItems.push(item);
      continue;
    }

    const currentDish = await Dish.findById(item.dishId);

    if (!currentDish) {
      adjustedItems.push(item);
      continue;
    }

    const rawQty = currentDish.quantity;

    const hasSpecificStock =
      rawQty !== undefined &&
      rawQty !== null &&
      Number(rawQty) > 0;

    if (hasSpecificStock) {
      const dishBefore = await Dish.findOneAndUpdate(
        { _id: item.dishId },
        [
          {
            $set: {
              quantity: {
                $max: [
                  {
                    $subtract: ["$quantity", item.quantity],
                  },
                  0,
                ],
              },
            },
          },
        ],
        { new: false }
      );

      const availableBefore = dishBefore?.quantity || 0;

      const actualQty = Math.min(
        item.quantity,
        availableBefore
      );

      if (actualQty < item.quantity) {
        stockAdjustments.push({
          name: item.name,
          requested: item.quantity,
          given: actualQty,
        });
      }

      if (actualQty > 0) {
        adjustedItems.push({
          ...item,
          quantity: actualQty,
          price: item.pricePerQuantity * actualQty,
        });
      }

      // Mark unavailable only when stock reaches zero.
      if (availableBefore - actualQty <= 0) {
        await Dish.findByIdAndUpdate(
          item.dishId,
          { isAvailable: false }
        );
      }
    } else {
      // Unlimited stock dish.
      adjustedItems.push(item);
    }
  }

  return {
    adjustedItems,
    stockAdjustments,
  };
};

const addOrder = async (req, res, next) => {
  try {
    const {
      customerDetails,
      orderStatus,
      orderType,
      orderDate,
      table,
      paymentMethod,
    } = req.body;

    // Backend-level payment validation.
    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      const error = createHttpError(
        400,
        "Invalid payment method. Only Cash or Online is allowed."
      );

      return next(error);
    }

    const items = req.body.items || [];

    const {
      adjustedItems,
      stockAdjustments,
    } = await adjustItemsForStock(items);

    if (
      items.length > 0 &&
      adjustedItems.length === 0
    ) {
      const error = createHttpError(
        400,
        "All items in this order are out of stock. Please refresh the menu."
      );

      return next(error);
    }

    // Recompute bills from actual adjusted items.
    const total = adjustedItems.reduce(
      (sum, item) => sum + item.price,
      0
    );

    const tax = Number(
      ((total * TAX_RATE) / 100).toFixed(2)
    );

    const totalWithTax = Number(
      (total + tax).toFixed(2)
    );

    // Only explicitly allowed order fields are accepted.
    // This prevents unnecessary client-side fields from being
    // copied directly into the Order document.
    const orderData = {
      customerDetails,
      orderStatus,
      orderType,
      items: adjustedItems,
      bills: {
        total,
        tax,
        totalWithTax,
      },
      paymentMethod,
    };

    // Preserve orderDate when supplied.
    if (orderDate) {
      orderData.orderDate = orderDate;
    }

    // Packing orders don't need a table.
    if (orderType !== "Packing" && table) {
      orderData.table = table;
    }

    const order = new Order(orderData);

    await order.save();

    res.status(201).json({
      success: true,
      message: "Order created!",
      data: order,
      stockAdjustments:
        stockAdjustments.length > 0
          ? stockAdjustments
          : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// Appends more items into an already placed order.
const addItemsToOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newItems = req.body.items || [];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(
        400,
        "Invalid order id!"
      );

      return next(error);
    }

    if (newItems.length === 0) {
      const error = createHttpError(
        400,
        "No items provided!"
      );

      return next(error);
    }

    const order = await Order.findById(id);

    if (!order) {
      const error = createHttpError(
        404,
        "Order not found!"
      );

      return next(error);
    }

    if (order.orderStatus === "Ready") {
      const error = createHttpError(
        400,
        "This order is already marked Ready. Please place a new order instead."
      );

      return next(error);
    }

    const {
      adjustedItems,
      stockAdjustments,
    } = await adjustItemsForStock(newItems);

    if (adjustedItems.length === 0) {
      const error = createHttpError(
        400,
        "All items are out of stock. Please refresh the menu."
      );

      return next(error);
    }

    // Merge same dishes.
    const mergedItems = [...order.items];

    for (const newItem of adjustedItems) {
      const existing = newItem.dishId
        ? mergedItems.find(
            (item) =>
              item.dishId &&
              item.dishId.toString() ===
                newItem.dishId.toString()
          )
        : null;

      if (existing) {
        existing.quantity += newItem.quantity;
        existing.price += newItem.price;
      } else {
        mergedItems.push(newItem);
      }
    }

    const total = mergedItems.reduce(
      (sum, item) => sum + item.price,
      0
    );

    const tax = Number(
      ((total * TAX_RATE) / 100).toFixed(2)
    );

    const totalWithTax = Number(
      (total + tax).toFixed(2)
    );

    order.items = mergedItems;

    order.bills = {
      total,
      tax,
      totalWithTax,
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: "Items added to order!",
      data: order,
      stockAdjustments:
        stockAdjustments.length > 0
          ? stockAdjustments
          : undefined,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(
        404,
        "Invalid id!"
      );

      return next(error);
    }

    const order = await Order.findById(id);

    if (!order) {
      const error = createHttpError(
        404,
        "Order not found!"
      );

      return next(error);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("table");

    res.status(200).json({
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(
        404,
        "Invalid id!"
      );

      return next(error);
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      const error = createHttpError(
        404,
        "Order not found!"
      );

      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Order updated",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Only deletes orders that are fully done:
// status "Ready" AND table is already free.
const deleteCompletedOrders = async (
  req,
  res,
  next
) => {
  try {
    const orders = await Order.find({
      orderStatus: "Ready",
    }).populate("table", "status");

    const idsToDelete = orders
      .filter(
        (order) =>
          !order.table ||
          order.table.status === "Available"
      )
      .map((order) => order._id);

    if (idsToDelete.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No completed orders to delete.",
        deletedCount: 0,
      });
    }

    await Order.deleteMany({
      _id: {
        $in: idsToDelete,
      },
    });

    res.status(200).json({
      success: true,
      message: `${idsToDelete.length} completed order(s) deleted!`,
      deletedCount: idsToDelete.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrder,
  addItemsToOrder,
  getOrderById,
  getOrders,
  updateOrder,
  deleteCompletedOrders,
};