require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const createHttpError = require("http-errors");
const app = express();

const PORT = config.port;
connectDB();

// Root Endpoint
app.get("/", (req, res) => {
    res.json({message: "Hello from POS Server!"});
});

// Global Error Handler
app.use(globalErrorHandler);

// Server
app.listen(PORT, () => {
    console.log(`POS Server is listening on port ${PORT}`);
})