const express = require("express");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const { addTable, getTables, updateTable } = require("../controllers/tableController");
const router = express.Router();

router.route("/").post(isVerifiedUser, addTable);
router.route("/").get(isVerifiedUser, getTables);
router.route("/:id").put(isVerifiedUser, updateTable);

module.exports = router;