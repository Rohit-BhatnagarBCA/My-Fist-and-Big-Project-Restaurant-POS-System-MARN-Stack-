const createHttpError = require("http-errors");

// Use after isVerifiedUser — req.user is already populated by then.
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    const error = createHttpError(403, "Only Admin can perform this action!");
    return next(error);
  }
  next();
};

module.exports = { isAdmin };