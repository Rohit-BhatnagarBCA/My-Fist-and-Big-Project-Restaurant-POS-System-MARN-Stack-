require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/database");

const User = require("../models/userModel");
const Restaurant = require("../models/restaurantModel");

const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const Dish = require("../models/dishModel");
const Category = require("../models/categoryModel");

const LEGACY_ADMIN_EMAIL = (
  process.env.LEGACY_ADMIN_EMAIL || ""
)
  .trim()
  .toLowerCase();

const LEGACY_RESTAURANT_NAME = (
  process.env.LEGACY_RESTAURANT_NAME ||
  "Legacy Restaurant"
).trim();

const LEGACY_STAFF_EMAILS = (
  process.env.LEGACY_STAFF_EMAILS || ""
)
  .split(",")
  .map((email) =>
    email.trim().toLowerCase()
  )
  .filter(Boolean);

const DRY_RUN =
  String(
    process.env.MIGRATION_DRY_RUN
  ).toLowerCase() !== "false";

// ============================================================
// HELPERS
// ============================================================

const getUnassignedFilter = () => ({
  $or: [
    {
      restaurantId: {
        $exists: false,
      },
    },
    {
      restaurantId: null,
    },
  ],
});

// ============================================================
// MIGRATION
// ============================================================

const migrate = async () => {
  try {
    await connectDB();

    console.log(
      "\n=========================================="
    );
    console.log(
      " LEGACY RESTAURANT MIGRATION"
    );
    console.log(
      "==========================================\n"
    );

    console.log(
      `Mode: ${
        DRY_RUN ? "DRY RUN" : "LIVE"
      }`
    );

    if (!LEGACY_ADMIN_EMAIL) {
      throw new Error(
        "LEGACY_ADMIN_EMAIL is required in .env"
      );
    }

    // ========================================================
    // 1. FIND LEGACY ADMIN
    // ========================================================

    const admin =
      await User.findOne({
        email: LEGACY_ADMIN_EMAIL,
        role: "Admin",
      });

    if (!admin) {
      throw new Error(
        `Admin not found for email: ${LEGACY_ADMIN_EMAIL}`
      );
    }

    console.log(
      `Legacy Admin: ${admin.name} <${admin.email}>`
    );

    // ========================================================
    // 2. FIND ONLY EXPLICIT LEGACY USERS
    // ========================================================

    const selectedEmails = Array.from(
      new Set([
        LEGACY_ADMIN_EMAIL,
        ...LEGACY_STAFF_EMAILS,
      ])
    );

    const selectedUsers =
      await User.find({
        email: {
          $in: selectedEmails,
        },
        role: {
          $in: [
            "Admin",
            "Waiter",
            "Kitchen",
          ],
        },
      }).select(
        "_id name email role restaurantId"
      );

    console.log(
      `Selected legacy users: ${selectedUsers.length}`
    );

    for (const user of selectedUsers) {
      console.log(
        `  - ${user.role}: ${user.name} <${user.email}>`
      );
    }

    // ========================================================
    // 3. FIND EXISTING RESTAURANT
    // ========================================================

    let restaurant = null;

    // First priority: admin already linked
    if (admin.restaurantId) {
      restaurant =
        await Restaurant.findById(
          admin.restaurantId
        );
    }

    // Second priority: restaurant owned by admin
    if (!restaurant) {
      restaurant =
        await Restaurant.findOne({
          owner: admin._id,
        });
    }

    // ========================================================
    // 4. DRY RUN
    // ========================================================

    if (DRY_RUN) {
      if (restaurant) {
        console.log(
          `\nExisting restaurant found: ${restaurant.name}`
        );

        console.log(
          `Restaurant ID: ${restaurant._id}`
        );
      } else {
        console.log(
          `[DRY RUN] Would create restaurant: ${LEGACY_RESTAURANT_NAME}`
        );
      }

      const unassignedTables =
        await Table.countDocuments(
          getUnassignedFilter()
        );

      const unassignedCategories =
        await Category.countDocuments(
          getUnassignedFilter()
        );

      const unassignedDishes =
        await Dish.countDocuments(
          getUnassignedFilter()
        );

      const unassignedOrders =
        await Order.countDocuments(
          getUnassignedFilter()
        );

      console.log(
        "\nCurrent unassigned data:"
      );

      console.log(
        `Tables     : ${unassignedTables}`
      );

      console.log(
        `Categories : ${unassignedCategories}`
      );

      console.log(
        `Dishes     : ${unassignedDishes}`
      );

      console.log(
        `Orders     : ${unassignedOrders}`
      );

      console.log(
        "\nUsers that WOULD be linked:"
      );

      for (const user of selectedUsers) {
        console.log(
          `  ${user.role} → ${user.email}`
        );
      }

      const untouchedUsers =
        await User.find({
          _id: {
            $nin:
              selectedUsers.map(
                (user) =>
                  user._id
              ),
          },
          role: {
            $ne: "SuperAdmin",
          },
          restaurantId: null,
        }).select(
          "name email role"
        );

      console.log(
        "\nUsers that will NOT be touched:"
      );

      if (
        untouchedUsers.length === 0
      ) {
        console.log(
          "  None"
        );
      } else {
        for (
          const user of
          untouchedUsers
        ) {
          console.log(
            `  ${user.role} → ${user.email}`
          );
        }
      }

      console.log(
        "\n=========================================="
      );

      console.log(
        " DRY RUN COMPLETE"
      );

      console.log(
        "==========================================\n"
      );

      console.log(
        "No database records were changed."
      );

      process.exit(0);
    }

    // ========================================================
    // 5. CREATE OR REUSE RESTAURANT
    // ========================================================

    if (!restaurant) {
      restaurant =
        await Restaurant.create({
          name:
            LEGACY_RESTAURANT_NAME,
          owner: admin._id,
          status: "pending",
        });

      console.log(
        `\nCreated restaurant: ${restaurant.name}`
      );
    } else {
      console.log(
        `\nUsing existing restaurant: ${restaurant.name}`
      );
    }

    console.log(
      `Restaurant ID: ${restaurant._id}`
    );

    // ========================================================
    // 6. LINK USERS WITHOUT MONGOOSE SAVE VALIDATION
    //
    // IMPORTANT:
    // We ONLY change restaurantId.
    // Existing invalid phone numbers are NOT revalidated.
    // ========================================================

    let linkedUsers = 0;

    for (const user of selectedUsers) {
      const result =
        await User.updateOne(
          {
            _id: user._id,
          },
          {
            $set: {
              restaurantId:
                restaurant._id,
            },
          }
        );

      if (
        result.modifiedCount > 0 ||
        result.matchedCount > 0
      ) {
        linkedUsers += 1;
      }
    }

    // ========================================================
    // 7. LINK OLD TABLES
    // ========================================================

    const tableMigration =
      await Table.updateMany(
        getUnassignedFilter(),
        {
          $set: {
            restaurantId:
              restaurant._id,
          },
        }
      );

    // ========================================================
    // 8. LINK OLD CATEGORIES
    // ========================================================

    const categoryMigration =
      await Category.updateMany(
        getUnassignedFilter(),
        {
          $set: {
            restaurantId:
              restaurant._id,
          },
        }
      );

    // ========================================================
    // 9. LINK OLD DISHES
    // ========================================================

    const dishMigration =
      await Dish.updateMany(
        getUnassignedFilter(),
        {
          $set: {
            restaurantId:
              restaurant._id,
          },
        }
      );

    // ========================================================
    // 10. LINK OLD ORDERS
    // ========================================================

    const orderMigration =
      await Order.updateMany(
        getUnassignedFilter(),
        {
          $set: {
            restaurantId:
              restaurant._id,
          },
        }
      );

    // ========================================================
    // 11. FINAL VERIFICATION
    // ========================================================

    const remainingTables =
      await Table.countDocuments(
        getUnassignedFilter()
      );

    const remainingCategories =
      await Category.countDocuments(
        getUnassignedFilter()
      );

    const remainingDishes =
      await Dish.countDocuments(
        getUnassignedFilter()
      );

    const remainingOrders =
      await Order.countDocuments(
        getUnassignedFilter()
      );

    const linkedAdmin =
      await User.findOne({
        _id: admin._id,
      }).select(
        "_id name email role restaurantId"
      );

    // ========================================================
    // FINAL OUTPUT
    // ========================================================

    console.log(
      "\n=========================================="
    );

    console.log(
      " MIGRATION COMPLETE"
    );

    console.log(
      "==========================================\n"
    );

    console.log(
      `Restaurant: ${restaurant.name}`
    );

    console.log(
      `Restaurant ID: ${restaurant._id}`
    );

    console.log(
      `Users linked     : ${linkedUsers}`
    );

    console.log(
      `Tables migrated  : ${tableMigration.modifiedCount}`
    );

    console.log(
      `Categories       : ${categoryMigration.modifiedCount}`
    );

    console.log(
      `Dishes           : ${dishMigration.modifiedCount}`
    );

    console.log(
      `Orders           : ${orderMigration.modifiedCount}`
    );

    console.log(
      "\nRemaining unassigned operational data:"
    );

    console.log(
      `Tables     : ${remainingTables}`
    );

    console.log(
      `Categories : ${remainingCategories}`
    );

    console.log(
      `Dishes     : ${remainingDishes}`
    );

    console.log(
      `Orders     : ${remainingOrders}`
    );

    console.log(
      "\nLegacy Admin after migration:"
    );

    console.log(
      `Name         : ${linkedAdmin?.name}`
    );

    console.log(
      `Email        : ${linkedAdmin?.email}`
    );

    console.log(
      `Restaurant ID: ${linkedAdmin?.restaurantId}`
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ MIGRATION FAILED"
    );

    console.error(
      error
    );

    process.exit(1);
  } finally {
    if (
      mongoose.connection.readyState
    ) {
      await mongoose.connection.close();
    }
  }
};

migrate();