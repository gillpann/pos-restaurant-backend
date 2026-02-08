const createHttpError = require("http-errors");
const User = require("../models/userModel");

const register = async (req, res, next) => {
    try {
        
        const {name, phone, email, password, role} = req.body;

        if(!name || !phone || !email || !password || !role){
            return next(createHttpError(400, "All fields are required!"));
        }

        const isUserPresent = await User.findOne({email});
        if(isUserPresent){
            return next(createHttpError(400, "User already exist!"));
        }

        const user = { name, phone, email, password, role };
        const newUser = User(user);
        await newUser.save();

        res.status(201).json({succes: true, message: "New user created!", data: newUser});

    } catch (error) {
        if (error.code === 11000) {
            return next(createHttpError(400, "User already exist!"));
        }
    }
}

const login = async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
}

module.exports = { register, login };