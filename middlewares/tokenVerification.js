const createHttpError = require("http-errors")
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const config = require("../config/config")


const isVerifiedUser = async (req, res, next) => {
    try {
        
        const { accessToken } = req.cookies;

        if(!accessToken) {
            return next(createHttpError(401, "Please provide token!"));
        }

        const decodeToken = jwt.verify(accessToken, config.accessTokenSecret);

        const user = await User.findById(decodeToken._id);

        if(!user) {
            return next(createHttpError(401, "User not exist!"));
        }

        req.user = user;
        next();

    } catch (error) {
        const err = createHttpError(401, "Invalid Token!");
        next(err);
    }
}

module.exports = { isVerifiedUser };