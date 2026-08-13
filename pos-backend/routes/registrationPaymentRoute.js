const express = require("express");
const router = express.Router();
const {
  quotePrice,
  createRegistrationOrder,
  verifyAndRegister,
} = require("../controllers/registrationPaymentController");

// No isVerifiedUser here on purpose — there's no account/token yet at this
// point, that's the whole point of this flow.
router.route("/quote").post(quotePrice);
router.route("/create-order").post(createRegistrationOrder);
router.route("/verify-and-register").post(verifyAndRegister);

module.exports = router;