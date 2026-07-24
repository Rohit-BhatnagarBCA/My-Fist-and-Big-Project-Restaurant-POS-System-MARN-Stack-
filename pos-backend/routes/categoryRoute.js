const express = require("express");
const { addCategory, getCategories, deleteCategory, updateCategory } = require("../controllers/categoryController");
const router = express.Router();
const { isVerifiedUser } = require("../middlewares/tokenVerification");

router.route("/").post(isVerifiedUser, addCategory);
router.route("/").get(isVerifiedUser, getCategories);
router.route("/:id").put(isVerifiedUser, updateCategory);
router.route("/:id").delete(isVerifiedUser, deleteCategory);

module.exports = router;