const createHttpError = require("http-errors");
const User = require("../models/userModel");
const Restaurant = require("../models/restaurantModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

// ======================================================
// PUBLIC REGISTER
// Creates only Restaurant Admin accounts.
// ======================================================

const register = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      restaurantName,
      phone,
      email,
      password,
    } = req.body;

    if (
      !name ||
      !restaurantName ||
      !phone ||
      !email ||
      !password
    ) {
      return next(
        createHttpError(
          400,
          "Name, restaurant name, phone, email and password are required!"
        )
      );
    }

    const cleanName =
      String(name).trim();

    const cleanRestaurantName =
      String(
        restaurantName
      ).trim();

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    const cleanPhone =
      String(phone).replace(
        /\D/g,
        ""
      );

    if (
      !/^\d{10}$/.test(
        cleanPhone
      )
    ) {
      return next(
        createHttpError(
          400,
          "Phone number must be exactly 10 digits!"
        )
      );
    }

    if (
      !/\S+@\S+\.\S+/.test(
        normalizedEmail
      )
    ) {
      return next(
        createHttpError(
          400,
          "Please provide a valid email address!"
        )
      );
    }

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return next(
        createHttpError(
          400,
          "An account with this email already exists!"
        )
      );
    }

    const user =
      new User({
        name: cleanName,
        phone: cleanPhone,
        email: normalizedEmail,
        password,
        role: "Admin",
      });

    await user.save();

    let restaurant;

    try {
      restaurant =
        await Restaurant.create({
          name:
            cleanRestaurantName,
          owner: user._id,
          status: "pending",
        });
    } catch (error) {
      await User.findByIdAndDelete(
        user._id
      );

      throw error;
    }

    try {
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
    } catch (error) {
      await Restaurant.findByIdAndDelete(
        restaurant._id
      );

      await User.findByIdAndDelete(
        user._id
      );

      throw error;
    }

    const safeUser =
      await User.findById(
        user._id
      ).select("-password");

    return res.status(201).json({
      success: true,
      message:
        "Restaurant account created successfully! Please login.",
      data: {
        user: safeUser,
        restaurant,
      },
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

    if (
      !email ||
      !password
    ) {
      return next(
        createHttpError(
          400,
          "All fields are required!"
        )
      );
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const usersWithEmail =
      await User.find({
        email: normalizedEmail,
      });

    if (
      !usersWithEmail.length
    ) {
      return next(
        createHttpError(
          401,
          "Invalid Credentials"
        )
      );
    }

    let matchedUser =
      null;

    for (
      const candidate of
      usersWithEmail
    ) {
      const isMatch =
        await bcrypt.compare(
          password,
          candidate.password
        );

      if (isMatch) {
        matchedUser =
          candidate;
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
          _id:
            matchedUser._id,
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
// ADMIN — CREATE STAFF
// Waiter / Kitchen only
// ======================================================

const createStaff = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.user?.restaurantId
    ) {
      return next(
        createHttpError(
          403,
          "Your account is not linked to a restaurant."
        )
      );
    }

    if (
      req.user.role !==
      "Admin"
    ) {
      return next(
        createHttpError(
          403,
          "Only restaurant Admins can manage staff."
        )
      );
    }

    const {
      name,
      email,
      phone,
      password,
      role,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !role
    ) {
      return next(
        createHttpError(
          400,
          "All staff fields are required."
        )
      );
    }

    if (
      !["Waiter", "Kitchen"].includes(
        role
      )
    ) {
      return next(
        createHttpError(
          400,
          "Staff role must be Waiter or Kitchen."
        )
      );
    }

    const cleanName =
      String(name).trim();

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    const cleanPhone =
      String(phone).replace(
        /\D/g,
        ""
      );

    if (
      !/^\d{10}$/.test(
        cleanPhone
      )
    ) {
      return next(
        createHttpError(
          400,
          "Phone number must be exactly 10 digits."
        )
      );
    }

    if (
      !/\S+@\S+\.\S+/.test(
        normalizedEmail
      )
    ) {
      return next(
        createHttpError(
          400,
          "Please provide a valid email address."
        )
      );
    }

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return next(
        createHttpError(
          400,
          "An account with this email already exists."
        )
      );
    }

    const staff =
      new User({
        name: cleanName,
        email: normalizedEmail,
        phone: cleanPhone,
        password,
        role,
        restaurantId:
          req.user.restaurantId,
      });

    await staff.save();

    staff.password =
      undefined;

    return res.status(201).json({
      success: true,
      message:
        `${role} account created successfully.`,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// ADMIN — GET MY STAFF
// ======================================================

const getMyStaff = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.user?.restaurantId
    ) {
      return next(
        createHttpError(
          403,
          "Your account is not linked to a restaurant."
        )
      );
    }

    if (
      req.user.role !==
      "Admin"
    ) {
      return next(
        createHttpError(
          403,
          "Only restaurant Admins can view staff."
        )
      );
    }

    const staff =
      await User.find({
        restaurantId:
          req.user.restaurantId,
        role: {
          $in: [
            "Waiter",
            "Kitchen",
          ],
        },
      })
        .select(
          "-password"
        )
        .sort({
          createdAt: -1,
        });

    const counts = {
      total: staff.length,

      waiter: staff.filter(
        (user) =>
          user.role ===
          "Waiter"
      ).length,

      kitchen: staff.filter(
        (user) =>
          user.role ===
          "Kitchen"
      ).length,
    };

    return res.status(200).json({
      success: true,
      counts,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// ADMIN — UPDATE STAFF
// Can change name, phone, role.
// Password update is intentionally separate.
// ======================================================

const updateStaff = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.user?.restaurantId
    ) {
      return next(
        createHttpError(
          403,
          "Your account is not linked to a restaurant."
        )
      );
    }

    if (
      req.user.role !==
      "Admin"
    ) {
      return next(
        createHttpError(
          403,
          "Only restaurant Admins can update staff."
        )
      );
    }

    const { id } =
      req.params;

    const {
      name,
      phone,
      role,
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
          "Invalid staff ID."
        )
      );
    }

    if (
      role !== undefined &&
      !["Waiter", "Kitchen"].includes(
        role
      )
    ) {
      return next(
        createHttpError(
          400,
          "Staff role must be Waiter or Kitchen."
        )
      );
    }

    const staff =
      await User.findOne({
        _id: id,
        restaurantId:
          req.user.restaurantId,
        role: {
          $in: [
            "Waiter",
            "Kitchen",
          ],
        },
      });

    if (!staff) {
      return next(
        createHttpError(
          404,
          "Staff member not found in your restaurant."
        )
      );
    }

    const updates = {};

    if (
      name !== undefined
    ) {
      const cleanName =
        String(name).trim();

      if (!cleanName) {
        return next(
          createHttpError(
            400,
            "Name cannot be empty."
          )
        );
      }

      updates.name =
        cleanName;
    }

    if (
      phone !== undefined
    ) {
      const cleanPhone =
        String(phone).replace(
          /\D/g,
          ""
        );

      if (
        !/^\d{10}$/.test(
          cleanPhone
        )
      ) {
        return next(
          createHttpError(
            400,
            "Phone number must be exactly 10 digits."
          )
        );
      }

      updates.phone =
        cleanPhone;
    }

    if (
      role !== undefined
    ) {
      updates.role =
        role;
    }

    if (
      Object.keys(updates)
        .length === 0
    ) {
      return next(
        createHttpError(
          400,
          "No changes provided."
        )
      );
    }

    const updatedStaff =
      await User.findOneAndUpdate(
        {
          _id: id,
          restaurantId:
            req.user.restaurantId,
          role: {
            $in: [
              "Waiter",
              "Kitchen",
            ],
          },
        },
        {
          $set: updates,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select(
        "-password"
      );

    return res.status(200).json({
      success: true,
      message:
        "Staff updated successfully.",
      data: updatedStaff,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// ADMIN — DELETE STAFF
// ======================================================

const deleteStaff = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.user?.restaurantId
    ) {
      return next(
        createHttpError(
          403,
          "Your account is not linked to a restaurant."
        )
      );
    }

    if (
      req.user.role !==
      "Admin"
    ) {
      return next(
        createHttpError(
          403,
          "Only restaurant Admins can remove staff."
        )
      );
    }

    const { id } =
      req.params;

    if (
      !id ||
      !id.match(
        /^[0-9a-fA-F]{24}$/
      )
    ) {
      return next(
        createHttpError(
          400,
          "Invalid staff ID."
        )
      );
    }

    const staff =
      await User.findOne({
        _id: id,
        restaurantId:
          req.user.restaurantId,
        role: {
          $in: [
            "Waiter",
            "Kitchen",
          ],
        },
      });

    if (!staff) {
      return next(
        createHttpError(
          404,
          "Staff member not found in your restaurant."
        )
      );
    }

    await User.deleteOne({
      _id: id,
      restaurantId:
        req.user.restaurantId,
    });

    return res.status(200).json({
      success: true,
      message:
        "Staff account removed successfully.",
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
        .populate(
          "restaurantId",
          "name status subscription"
        )
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
      const {
        id,
      } = req.params;

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

      if (
        isActive === false
      ) {
        user.subscription = {
          ...(
            user.subscription?.toObject
              ? user.subscription.toObject()
              : user.subscription ||
                {}
          ),
          startDate: null,
          expiryDate:
            new Date(0),
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

      let newExpiryDate;

      if (expiryDate) {
        newExpiryDate =
          new Date(
            expiryDate
          );

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
        ...(
          user.subscription?.toObject
            ? user.subscription.toObject()
            : user.subscription ||
              {}
        ),
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

  createStaff,
  getMyStaff,
  updateStaff,
  deleteStaff,

  getAllUsers,
  updateUserSubscription,
};