const createHttpError = require("http-errors");

const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        createHttpError(401, "Authentication required.")
      );
    }

    if (req.user.role !== "Admin") {
      return next(
        createHttpError(403, "Admin access required.")
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isAdmin };