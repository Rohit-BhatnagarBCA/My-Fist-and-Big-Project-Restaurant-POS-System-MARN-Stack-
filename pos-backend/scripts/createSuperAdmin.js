require("dotenv").config();

const connectDB = require("../config/database");
const User = require("../models/userModel");

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const {
      SUPER_ADMIN_NAME,
      SUPER_ADMIN_EMAIL,
      SUPER_ADMIN_PHONE,
      SUPER_ADMIN_PASSWORD,
    } = process.env;

    if (
      !SUPER_ADMIN_NAME ||
      !SUPER_ADMIN_EMAIL ||
      !SUPER_ADMIN_PHONE ||
      !SUPER_ADMIN_PASSWORD
    ) {
      throw new Error(
        "Super Admin environment variables are missing."
      );
    }

    const email = SUPER_ADMIN_EMAIL
      .trim()
      .toLowerCase();

    const existing = await User.findOne({
      email,
      role: "SuperAdmin",
    });

    if (existing) {
      console.log(
        "Super Admin already exists."
      );
      process.exit(0);
    }

    await User.create({
      name: SUPER_ADMIN_NAME.trim(),
      email,
      phone: SUPER_ADMIN_PHONE,
      password: SUPER_ADMIN_PASSWORD,
      role: "SuperAdmin",
    });

    console.log(
      "✅ Super Admin created successfully."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Failed:",
      error.message
    );

    process.exit(1);
  }
};

createSuperAdmin();