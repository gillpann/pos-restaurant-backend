const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('../config/config');
const Payment = require('../models/PaymentModel'); 


const createOrder = async (req, res, next) => {
    try {
        const { amount, currency = 'usd'} = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid amount" 
            });
        }
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), 
            currency: currency.toLowerCase(),
            automatic_payment_methods: {
                enabled: true,
            },
        });
        
        res.json({ 
            success: true, 
            order: {
                id: paymentIntent.id,
                clientSecret: paymentIntent.client_secret, 
                amount: amount,
            }
        });
        
    } catch (error) {
        console.error('Payment creation error:', error);
        next(error);
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const { payment_intent_id } = req.body;
        
        if (!payment_intent_id) {
            return res.status(400).json({
                success: false,
                message: "Payment Intent ID is required"
            });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
        
        if (paymentIntent.status === 'succeeded') {
            res.json({ 
                success: true, 
                message: "Payment verified successfully!", 
                payment: {
                    id: paymentIntent.id,
                    amount: paymentIntent.amount / 100,
                    status: paymentIntent.status
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed!"
            });
        }
        
    } catch (error) {
        console.error('Payment verification error:', error);
        next(error);
    }
};

const getConfig = (req, res) => {
    res.json({ 
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY 
    });
};

const webhookVerification = async (req, res, next) => {
    try {
        const secret = config.stripeWebhookSecret; 
        const signature = req.headers['stripe-signature'];
        
        let event;
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                secret
            );
        } catch (err) {
            console.log('Invalid Signature!', err.message);
            const error = createHttpError(400, "Invalid Signature!");
            return next(error);
        }

        console.log("Webhook verified:", event.type);

        console.log("FULL WEBHOOK DATA:", JSON.stringify(event, null, 2));

        if (event.type === 'payment_intent.succeeded') {
            const payment = event.data.object;
            console.log("💰 PAYMENT SUMMARY:", {
                id: payment.id,
                amount: `$${payment.amount / 100}`,
                currency: payment.currency.toUpperCase(),
                status: payment.status,
                payment_method: payment.payment_method,
                created: new Date(payment.created * 1000).toLocaleString()
            });
            
            try {
                const existingPayment = await Payment.findOne({ paymentId: payment.id });
                
                if (!existingPayment) {
                    const newPayment = new Payment({
                        paymentId: payment.id,
                        orderId: payment.metadata?.order_id || `order_${Date.now()}`,
                        amount: payment.amount,
                        currency: payment.currency,
                        status: payment.status,
                        paymentMethod: payment.payment_method,
                        metadata: payment.metadata || {},
                        createdAt: new Date(payment.created * 1000)
                    });
                    
                    await newPayment.save();
                    
                    console.log("Payment saved to database:", newPayment._id);
                } else {
                    console.log("Payment already exists in database");
                }
                
            } catch (dbError) {
                console.error("Error saving payment to database:", dbError);
            }
        }

        res.json({ success: true });

    } catch (error) {
        console.log(error);
        next(error);
    }
};
module.exports = { 
    createOrder,
    verifyPayment,
    getConfig,
    webhookVerification,
};