const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/userModel");

const isVerifiedUser = async (
  req,
  res,
  next
) => {
  try {
    const { accessToken } =
      req.cookies;

    if (!accessToken) {
      return next(
        createHttpError(
          401,
          "Please provide token!"
        )
      );
    }

    const decodeToken =
      jwt.verify(
        accessToken,
        config.accessTokenSecret
      );

    const user =
      await User.findById(
        decodeToken._id
      );

    if (!user) {
      return next(
        createHttpError(
          401,
          "User does not exist!"
        )
      );
    }

    req.user = user;

    next();
  } catch (error) {
    return next(
      createHttpError(
        401,
        "Invalid Token!"
      )
    );
  }
};

const isAdmin = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return next(
      createHttpError(
        401,
        "Authentication required!"
      )
    );
  }

  if (req.user.role !== "Admin") {
    return next(
      createHttpError(
        403,
        "Admin access required!"
      )
    );
  }

  next();
};

const isSuperAdmin = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return next(
      createHttpError(
        401,
        "Authentication required!"
      )
    );
  }

  if (
    req.user.role !== "SuperAdmin"
  ) {
    return next(
      createHttpError(
        403,
        "Super Admin access required!"
      )
    );
  }

  next();
};

module.exports = {
  isVerifiedUser,
  isAdmin,
  isSuperAdmin,
};