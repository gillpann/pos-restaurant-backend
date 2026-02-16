const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    orderId: String,
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'usd'
    },
    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed', 'canceled'],
        default: 'pending'
    },
    paymentMethod: String,
    metadata: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;