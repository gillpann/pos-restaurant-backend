const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config")

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
        const newUser = new User(user);

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "New user created!",
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return next(createHttpError(400, "User already exist!"));
        }
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        
        const { email, password } = req.body;

        if (!email || !password) {
            return next(createHttpError(400, "Email and password are required!"));
        }

        const isUserPresent = await User.findOne({email});
        if(!isUserPresent){
            return next(createHttpError(401, "Invalid Credentials"));
        }

        const isMatch = await bcrypt.compare(password, isUserPresent.password);
        if (!isMatch) {
            return next(createHttpError(401, "Invalid Credentials"));
        }

        const accessToken = jwt.sign({_id: isUserPresent._id}, config.accessTokenSecret, {
            expiresIn: "1d"
        })

        res.cookie("accessToken", accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            sameSite: "none",
            secure: true
        });

        res.status(200).json({
            succes: true,
            message: "User login successfully!",
            data: {
                id: isUserPresent._id,
                name: isUserPresent.name,
                email: isUserPresent.email,
                phone: isUserPresent.phone,
                role: isUserPresent.role,
            }
        });

    } catch (error) {
        next(error);
    }
}

const getUserData = async (req, res, next) => {
    try{

        const user = await User.findById(req.user._id);
        res.status(200).json({
            success: true,
            message: "User login successfully!",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            }
        });
        
    } catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {
        
        res.clearCookie('accessToken')
        res.status(200).json({success: true, message: "User logout successfully!"});
    } catch (error) {
        next(error);
    }
}


module.exports = { register, login, getUserData, logout };