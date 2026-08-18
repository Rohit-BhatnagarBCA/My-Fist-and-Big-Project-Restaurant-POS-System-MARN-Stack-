const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

// ======================================================
// REGISTER
// ======================================================

const register = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      role,
    } = req.body;

    if (
      !name ||
      !phone ||
      !email ||
      !password ||
      !role
    ) {
      return next(
        createHttpError(
          400,
          "All fields are required!"
        )
      );
    }

    // --------------------------------------------------
    // Public registration can NEVER create SuperAdmin.
    // --------------------------------------------------

    const allowedPublicRoles = [
      "Waiter",
      "Kitchen",
      "Admin",
    ];

    if (!allowedPublicRoles.includes(role)) {
      return next(
        createHttpError(
          403,
          "This role cannot be created through public registration."
        )
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const isUserPresent =
      await User.findOne({
        email: normalizedEmail,
        role,
      });

    if (isUserPresent) {
      return next(
        createHttpError(
          400,
          `A ${role} account with this email already exists!`
        )
      );
    }

    const user = new User({
      name: name.trim(),
      phone,
      email: normalizedEmail,
      password,
      role,
    });

    await user.save();

    user.password = undefined;

    return res.status(201).json({
      success: true,
      message:
        "New user created! Please login.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// LOGIN
// ======================================================

const login = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return next(
        createHttpError(
          400,
          "All fields are required!"
        )
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const usersWithEmail =
      await User.find({
        email: normalizedEmail,
      });

    if (!usersWithEmail.length) {
      return next(
        createHttpError(
          401,
          "Invalid Credentials"
        )
      );
    }

    let matchedUser = null;

    for (const candidate of usersWithEmail) {
      const isMatch =
        await bcrypt.compare(
          password,
          candidate.password
        );

      if (isMatch) {
        matchedUser = candidate;
        break;
      }
    }

    if (!matchedUser) {
      return next(
        createHttpError(
          401,
          "Invalid Credentials"
        )
      );
    }

    const accessToken =
      jwt.sign(
        {
          _id: matchedUser._id,
        },
        config.accessTokenSecret,
        {
          expiresIn: "1d",
        }
      );

    res.cookie(
      "accessToken",
      accessToken,
      {
        maxAge:
          1000 *
          60 *
          60 *
          24 *
          30,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      }
    );

    matchedUser.password =
      undefined;

    return res.status(200).json({
      success: true,
      message:
        "User login successfully!",
      data: matchedUser,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET CURRENT USER
// ======================================================

const getUserData = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      ).select("-password");

    if (!user) {
      return next(
        createHttpError(
          404,
          "User not found!"
        )
      );
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// LOGOUT
// ======================================================

const logout = async (
  req,
  res,
  next
) => {
  try {
    res.clearCookie(
      "accessToken",
      {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "User logout successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// SUPER ADMIN — GET ALL USERS
// ======================================================

const getAllUsers = async (
  req,
  res,
  next
) => {
  try {
    const users =
      await User.find({})
        .select("-password")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// SUPER ADMIN — UPDATE USER SUBSCRIPTION
// ======================================================

const updateUserSubscription =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.params;

      const {
        isActive,
        expiryDate,
      } = req.body;

      if (
        !id ||
        !id.match(
          /^[0-9a-fA-F]{24}$/
        )
      ) {
        return next(
          createHttpError(
            400,
            "Invalid user ID!"
          )
        );
      }

      if (
        typeof isActive !==
        "boolean"
      ) {
        return next(
          createHttpError(
            400,
            "isActive must be true or false!"
          )
        );
      }

      const user =
        await User.findById(id);

      if (!user) {
        return next(
          createHttpError(
            404,
            "User not found!"
          )
        );
      }

      // --------------------------------------------------
      // Never allow the SuperAdmin to disable itself.
      // --------------------------------------------------

      if (
        req.user._id.toString() ===
          id &&
        isActive === false
      ) {
        return next(
          createHttpError(
            400,
            "You cannot disable your own Super Admin account!"
          )
        );
      }

      // --------------------------------------------------
      // SUPER ADMIN cannot accidentally disable another
      // SuperAdmin account through subscription controls.
      // --------------------------------------------------

      if (
        user.role ===
          "SuperAdmin" &&
        isActive === false
      ) {
        return next(
          createHttpError(
            400,
            "Super Admin accounts cannot be disabled through subscription controls!"
          )
        );
      }

      // ==================================================
      // DISABLE SUBSCRIPTION
      // ==================================================

      if (isActive === false) {
        user.subscription = {
          ...(user.subscription?.toObject
            ? user.subscription.toObject()
            : user.subscription || {}),

          startDate: null,
          expiryDate: new Date(0),
        };

        await user.save();

        const safeUser =
          user.toObject();

        delete safeUser.password;

        return res.status(200).json({
          success: true,
          message:
            "Subscription disabled successfully!",
          data: safeUser,
        });
      }

      // ==================================================
      // ACTIVATE SUBSCRIPTION
      // ==================================================

      let newExpiryDate;

      if (expiryDate) {
        newExpiryDate =
          new Date(expiryDate);

        if (
          Number.isNaN(
            newExpiryDate.getTime()
          )
        ) {
          return next(
            createHttpError(
              400,
              "Invalid expiry date!"
            )
          );
        }

        if (
          newExpiryDate <=
          new Date()
        ) {
          return next(
            createHttpError(
              400,
              "Expiry date must be in the future!"
            )
          );
        }
      } else {
        newExpiryDate =
          new Date();

        newExpiryDate.setDate(
          newExpiryDate.getDate() +
            30
        );
      }

      user.subscription = {
        ...(user.subscription?.toObject
          ? user.subscription.toObject()
          : user.subscription || {}),

        startDate:
          user.subscription
            ?.startDate ||
          new Date(),

        expiryDate:
          newExpiryDate,
      };

      await user.save();

      const safeUser =
        user.toObject();

      delete safeUser.password;

      return res.status(200).json({
        success: true,
        message:
          "Subscription activated successfully!",
        data: safeUser,
      });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  register,
  login,
  getUserData,
  logout,
  getAllUsers,
  updateUserSubscription,
};