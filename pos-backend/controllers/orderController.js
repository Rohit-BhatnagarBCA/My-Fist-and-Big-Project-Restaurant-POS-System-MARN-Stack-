const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Dish = require("../models/dishModel");
const Table = require("../models/tableModel");
const mongoose = require("mongoose");

// Tax rate must stay in sync with
// pos-frontend/src/components/menu/Bill.jsx
const TAX_RATE = 5.25;

// Only these payment methods are allowed.
// Online means manual QR/UPI payment.
// There is no Razorpay payment gateway anymore.
const ALLOWED_PAYMENT_METHODS = [
  "Cash",
  "Online",
];

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
// STOCK ADJUSTMENT
//
// IMPORTANT:
// Every dish lookup/update is restricted to the current
// restaurant.
// ============================================================

const adjustItemsForStock = async (
  items,
  restaurantId
) => {
  const stockAdjustments = [];
  const adjustedItems = [];

  for (const item of items) {
    // No valid dish reference.
    if (
      !item.dishId ||
      !mongoose.Types.ObjectId.isValid(
        item.dishId
      )
    ) {
      adjustedItems.push(item);
      continue;
    }

    // --------------------------------------------------------
    // VERY IMPORTANT:
    // Dish must belong to current restaurant.
    // --------------------------------------------------------

    const currentDish =
      await Dish.findOne({
        _id: item.dishId,
        restaurantId,
      });

    if (!currentDish) {
      throw createHttpError(
        404,
        `Dish "${item.name || item.dishId}" was not found in your restaurant.`
      );
    }

    const rawQty =
      currentDish.quantity;

    const hasSpecificStock =
      rawQty !== undefined &&
      rawQty !== null &&
      Number(rawQty) > 0;

    if (hasSpecificStock) {
      // ------------------------------------------------------
      // Atomic stock reduction scoped to restaurant.
      // ------------------------------------------------------

      const dishBefore =
        await Dish.findOneAndUpdate(
          {
            _id: item.dishId,
            restaurantId,
            quantity: {
              $gt: 0,
            },
          },
          [
            {
              $set: {
                quantity: {
                  $max: [
                    {
                      $subtract: [
                        "$quantity",
                        item.quantity,
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          ],
          {
            new: false,
          }
        );

      if (!dishBefore) {
        throw createHttpError(
          400,
          `${item.name || "Dish"} is currently out of stock.`
        );
      }

      const availableBefore =
        Number(
          dishBefore.quantity
        ) || 0;

      const requestedQty =
        Number(item.quantity) || 0;

      const actualQty = Math.min(
        requestedQty,
        availableBefore
      );

      if (
        actualQty <
        requestedQty
      ) {
        stockAdjustments.push({
          name: item.name,
          requested:
            requestedQty,
          given: actualQty,
        });
      }

      if (actualQty > 0) {
        adjustedItems.push({
          ...item,
          quantity:
            actualQty,
          price:
            item.pricePerQuantity *
            actualQty,
        });
      }

      // Mark unavailable only when stock reaches zero.
      if (
        availableBefore -
          actualQty <=
        0
      ) {
        await Dish.findOneAndUpdate(
          {
            _id: item.dishId,
            restaurantId,
          },
          {
            isAvailable: false,
          }
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

// ============================================================
// VALIDATE TABLE OWNERSHIP
// ============================================================

const validateTable = async (
  tableId,
  restaurantId
) => {
  if (!tableId) {
    return null;
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      tableId
    )
  ) {
    throw createHttpError(
      400,
      "Invalid table id!"
    );
  }

  const table =
    await Table.findOne({
      _id: tableId,
      restaurantId,
    });

  if (!table) {
    throw createHttpError(
      404,
      "Table not found in this restaurant!"
    );
  }

  return table;
};

// ============================================================
// ADD ORDER
// ============================================================

const addOrder = async (
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
      customerDetails,
      orderStatus,
      orderType,
      orderDate,
      table,
      paymentMethod,
    } = req.body;

    // --------------------------------------------------------
    // Payment validation
    // --------------------------------------------------------

    if (
      !ALLOWED_PAYMENT_METHODS.includes(
        paymentMethod
      )
    ) {
      return next(
        createHttpError(
          400,
          "Invalid payment method. Only Cash or Online is allowed."
        )
      );
    }

    // --------------------------------------------------------
    // Table validation
    // --------------------------------------------------------

    let selectedTable =
      null;

    if (
      orderType !== "Packing" &&
      table
    ) {
      selectedTable =
        await validateTable(
          table,
          restaurantId
        );
    }

    const items =
      req.body.items || [];

    const {
      adjustedItems,
      stockAdjustments,
    } =
      await adjustItemsForStock(
        items,
        restaurantId
      );

    if (
      items.length > 0 &&
      adjustedItems.length === 0
    ) {
      return next(
        createHttpError(
          400,
          "All items in this order are out of stock. Please refresh the menu."
        )
      );
    }

    // --------------------------------------------------------
    // Recompute bills from actual items
    // --------------------------------------------------------

    const total =
      adjustedItems.reduce(
        (sum, item) =>
          sum + item.price,
        0
      );

    const tax = Number(
      (
        (total * TAX_RATE) /
        100
      ).toFixed(2)
    );

    const totalWithTax =
      Number(
        (
          total + tax
        ).toFixed(2)
      );

    // --------------------------------------------------------
    // Order data
    // --------------------------------------------------------

    const orderData = {
      restaurantId,

      customerDetails,

      orderStatus,

      orderType,

      items:
        adjustedItems,

      bills: {
        total,

        tax,

        totalWithTax,
      },

      paymentMethod,
    };

    if (orderDate) {
      orderData.orderDate =
        orderDate;
    }

    if (
      orderType !== "Packing" &&
      selectedTable
    ) {
      orderData.table =
        selectedTable._id;
    }

    const order =
      new Order(orderData);

    await order.save();

    return res.status(201).json({
      success: true,
      message:
        "Order created!",

      data: order,

      stockAdjustments:
        stockAdjustments.length >
        0
          ? stockAdjustments
          : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// APPEND ITEMS TO EXISTING ORDER
// ============================================================

const addItemsToOrder = async (
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

    const { id } =
      req.params;

    const newItems =
      req.body.items || [];

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return next(
        createHttpError(
          400,
          "Invalid order id!"
        )
      );
    }

    if (
      newItems.length === 0
    ) {
      return next(
        createHttpError(
          400,
          "No items provided!"
        )
      );
    }

    // --------------------------------------------------------
    // Order MUST belong to current restaurant.
    // --------------------------------------------------------

    const order =
      await Order.findOne({
        _id: id,
        restaurantId,
      });

    if (!order) {
      return next(
        createHttpError(
          404,
          "Order not found!"
        )
      );
    }

    if (
      order.orderStatus ===
      "Ready"
    ) {
      return next(
        createHttpError(
          400,
          "This order is already marked Ready. Please place a new order instead."
        )
      );
    }

    const {
      adjustedItems,
      stockAdjustments,
    } =
      await adjustItemsForStock(
        newItems,
        restaurantId
      );

    if (
      adjustedItems.length ===
      0
    ) {
      return next(
        createHttpError(
          400,
          "All items are out of stock. Please refresh the menu."
        )
      );
    }

    // --------------------------------------------------------
    // Merge same dishes
    // --------------------------------------------------------

    const mergedItems = [
      ...order.items,
    ];

    for (const newItem of adjustedItems) {
      const existing =
        newItem.dishId
          ? mergedItems.find(
              (item) =>
                item.dishId &&
                item.dishId.toString() ===
                  newItem.dishId.toString()
            )
          : null;

      if (existing) {
        existing.quantity +=
          newItem.quantity;

        existing.price +=
          newItem.price;
      } else {
        mergedItems.push(
          newItem
        );
      }
    }

    const total =
      mergedItems.reduce(
        (sum, item) =>
          sum + item.price,
        0
      );

    const tax = Number(
      (
        (total * TAX_RATE) /
        100
      ).toFixed(2)
    );

    const totalWithTax =
      Number(
        (
          total + tax
        ).toFixed(2)
      );

    order.items =
      mergedItems;

    order.bills = {
      total,

      tax,

      totalWithTax,
    };

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        "Items added to order!",

      data: order,

      stockAdjustments:
        stockAdjustments.length >
        0
          ? stockAdjustments
          : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ORDER BY ID
// ============================================================

const getOrderById = async (
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

    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return next(
        createHttpError(
          404,
          "Invalid id!"
        )
      );
    }

    const order =
      await Order.findOne({
        _id: id,
        restaurantId,
      }).populate(
        "table"
      );

    if (!order) {
      return next(
        createHttpError(
          404,
          "Order not found!"
        )
      );
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL ORDERS
// ============================================================

const getOrders = async (
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

    const orders =
      await Order.find({
        restaurantId,
      })
        .populate(
          "table"
        )
        .sort({
          orderDate: -1,
        });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE ORDER STATUS
// ============================================================

const updateOrder = async (
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
      orderStatus,
    } = req.body;

    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return next(
        createHttpError(
          404,
          "Invalid id!"
        )
      );
    }

    const order =
      await Order.findOneAndUpdate(
        {
          _id: id,
          restaurantId,
        },
        {
          orderStatus,
        },
        {
          new: true,
        }
      );

    if (!order) {
      return next(
        createHttpError(
          404,
          "Order not found!"
        )
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Order updated",

      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE COMPLETED ORDERS
//
// Only completed orders belonging to current restaurant.
// ============================================================

const deleteCompletedOrders =
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

      if (!restaurantId)
        return;

      const orders =
        await Order.find({
          restaurantId,

          orderStatus:
            "Ready",
        }).populate(
          "table",
          "status"
        );

      const idsToDelete =
        orders
          .filter(
            (order) =>
              !order.table ||
              order.table.status ===
                "Available"
          )
          .map(
            (order) =>
              order._id
          );

      if (
        idsToDelete.length ===
        0
      ) {
        return res
          .status(200)
          .json({
            success: true,

            message:
              "No completed orders to delete.",

            deletedCount: 0,
          });
      }

      await Order.deleteMany({
        _id: {
          $in: idsToDelete,
        },

        restaurantId,
      });

      return res.status(200).json({
        success: true,

        message: `${idsToDelete.length} completed order(s) deleted!`,

        deletedCount:
          idsToDelete.length,
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