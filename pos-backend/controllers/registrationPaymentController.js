const Razorpay = require("razorpay");
const crypto = require("crypto");
const createHttpError = require("http-errors");
const config = require("../config/config");
const User = require("../models/userModel");
const {
  BUSINESS_PLANS,
  calculateAmount,
  calculateExpiry,
} = require("../config/pricing");

// Is there an Admin account with this email whose subscription is still
// active right now? Used to decide the Waiter/Kitchen discount tier.
const findActivePaidAdmin = async (email) => {
  const admin = await User.findOne({ email, role: "Admin" });
  if (!admin || !admin.subscription?.expiryDate) return null;
  if (new Date(admin.subscription.expiryDate) < new Date()) return null;
  return admin;
};

// POST /api/registration-payment/quote
// Tells the registration form what this account will cost before any
// payment happens, so the price shown is always real.
const quotePrice = async (req, res, next) => {
  try {
    const { role, plan, duration, email } = req.body;

    if (!role || !email) {
      return next(createHttpError(400, "Role and email are required."));
    }

    let isLinkedToAdmin = false;
    if (role !== "Admin") {
      const admin = await findActivePaidAdmin(email);
      isLinkedToAdmin = Boolean(admin);
    } else if (!plan || !duration) {
      return next(createHttpError(400, "Plan and duration are required for Admin."));
    }

    const amount = calculateAmount({ role, plan, duration, isLinkedToAdmin });

    res.status(200).json({
      success: true,
      amount,
      isLinkedToAdmin,
      excelExport: role === "Admin" ? BUSINESS_PLANS[plan]?.excelExport : undefined,
    });
  } catch (error) {
    next(createHttpError(400, error.message || "Could not calculate price."));
  }
};

// POST /api/registration-payment/create-order
const createRegistrationOrder = async (req, res, next) => {
  try {
    const { role, plan, duration, email } = req.body;

    let isLinkedToAdmin = false;
    if (role !== "Admin") {
      const admin = await findActivePaidAdmin(email);
      isLinkedToAdmin = Boolean(admin);
    }

    // Recomputed server-side — the amount is never taken from the client.
    const amount = calculateAmount({ role, plan, duration, isLinkedToAdmin });

    const razorpay = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpaySecretKey,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `reg_${Date.now()}`,
    });

    res.status(200).json({ success: true, order, amount });
  } catch (error) {
    console.log(error);
    next(createHttpError(400, error.message || "Could not start payment."));
  }
};

// POST /api/registration-payment/verify-and-register
// Only after this succeeds does the actual User account get created.
const verifyAndRegister = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      phone,
      password,
      role,
      plan,
      duration,
    } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", config.razorpaySecretKey)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return next(createHttpError(400, "Payment verification failed!"));
    }

    // Same email + same role already exists (e.g. double submission).
    const isUserPresent = await User.findOne({ email, role });
    if (isUserPresent) {
      return next(createHttpError(400, `A ${role} account with this email already exists!`));
    }

    let isLinkedToAdmin = false;
    let linkedAdminEmail = null;
    if (role !== "Admin") {
      const admin = await findActivePaidAdmin(email);
      if (admin) {
        isLinkedToAdmin = true;
        linkedAdminEmail = email;
      }
    }

    const amount = calculateAmount({ role, plan, duration, isLinkedToAdmin });
    const effectiveDuration = role === "Admin" ? duration : "Monthly";
    const expiryDate = isLinkedToAdmin ? null : calculateExpiry(effectiveDuration);

    const user = new User({
      name,
      email,
      phone,
      password,
      role,
      subscription: {
        plan: role === "Admin" ? plan : "Staff",
        duration: effectiveDuration,
        amountPaid: amount,
        startDate: new Date(),
        expiryDate,
        linkedAdminEmail,
      },
    });

    await user.save();
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "Payment successful — account created!",
      data: user,
      unlockedStaffDiscount: role === "Admin",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { quotePrice, createRegistrationOrder, verifyAndRegister };