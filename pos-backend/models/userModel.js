const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: {
          validator: function (v) {
            return /\S+@\S+\.\S+/.test(v);
          },
          message:
            "Email must be in valid format!",
        },
      },

      phone: {
        type: Number,
        required: true,
        validate: {
          validator: function (v) {
            return /^\d{10}$/.test(
              String(v)
            );
          },
          message:
            "Phone number must be a 10-digit number!",
        },
      },

      password: {
        type: String,
        required: true,
      },

      role: {
        type: String,
        required: true,
        enum: [
          "Waiter",
          "Kitchen",
          "Admin",
          "SuperAdmin",
        ],
      },

      // =====================================================
      // RESTAURANT RELATION
      // =====================================================

      restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        default: null,
        index: true,
      },

      // =====================================================
      // CURRENT SUBSCRIPTION
      //
      // NOTE:
      // Abhi compatibility ke liye user-level subscription
      // ko remove nahi kar rahe.
      // Later chunk me restaurant-level subscription par
      // migrate karenge.
      // =====================================================

      subscription: {
        plan: {
          type: String,
          default: null,
        },

        duration: {
          type: String,
          default: null,
        },

        amountPaid: {
          type: Number,
          default: 0,
        },

        startDate: {
          type: Date,
          default: null,
        },

        expiryDate: {
          type: Date,
          default: null,
        },

        linkedAdminEmail: {
          type: String,
          default: null,
        },
      },
    },
    {
      timestamps: true,
    }
  );

userSchema.pre(
  "save",
  async function (next) {
    if (
      !this.isModified("password")
    ) {
      return next();
    }

    try {
      const salt =
        await bcrypt.genSalt(10);

      this.password =
        await bcrypt.hash(
          this.password,
          salt
        );

      next();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);