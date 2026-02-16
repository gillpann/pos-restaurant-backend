const express = require("express");
const { 
    createOrder, 
    verifyPayment,
    getConfig,
    webhookVerification
} = require("../controllers/paymentController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

router.route("/config").get(getConfig);

router.route("/create-order").post(isVerifiedUser, createOrder);

router.route("/verify-payment").post(isVerifiedUser, verifyPayment);

router.route("/webhook-verification").post(
    express.raw({ type: 'application/json' }), 
    webhookVerification
);

module.exports = router;