require("dotenv").config();

const connectDB = require("../config/database");

const User = require("../models/userModel");
const Restaurant = require("../models/restaurantModel");
const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const Dish = require("../models/dishModel");
const Category = require("../models/categoryModel");
const Payment = require("../models/paymentModel");
const Notification = require("../models/notificationModel");
const SubscriptionRequest = require("../models/subscriptionRequestModel");

const resetDatabase = async () => {
  try {
    await connectDB();

    console.log("⚠️  Deleting all data...");

    await User.deleteMany({});
    console.log("✅ Users deleted");

    await Restaurant.deleteMany({});
    console.log("✅ Restaurants deleted");

    await Order.deleteMany({});
    console.log("✅ Orders deleted");

    await Table.deleteMany({});
    console.log("✅ Tables deleted");

    await Dish.deleteMany({});
    console.log("✅ Dishes deleted");

    await Category.deleteMany({});
    console.log("✅ Categories deleted");

    await Payment.deleteMany({});
    console.log("✅ Payments deleted");

    await Notification.deleteMany({});
    console.log("✅ Notifications deleted");

    await SubscriptionRequest.deleteMany({});
    console.log("✅ Subscription requests deleted");

    console.log("\n🎉 Database is now completely empty.");
    console.log("👉 Run 'npm run create:superadmin' again to recreate your Super Admin account.\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error.message);
    process.exit(1);
  }
};

resetDatabase();