const express = require("express");
const { addDish, getDishes, updateDish, deleteDish } = require("../controllers/dishController");
const router = express.Router();
const { isVerifiedUser } = require("../middlewares/tokenVerification");

router.route("/").post(isVerifiedUser, addDish);
router.route("/").get(isVerifiedUser, getDishes);
router.route("/:id").put(isVerifiedUser, updateDish);
router.route("/:id").delete(isVerifiedUser, deleteDish);

module.exports = router;