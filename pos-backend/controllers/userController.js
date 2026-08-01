const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const register = async (req, res, next) => {
    try {

        const { name, phone, email, password, role } = req.body;

        if(!name || !phone || !email || !password || !role){
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        // Same restaurant can share one email across roles (e.g. Admin +
        // Kitchen login), differentiated by password. Only block a true
        // duplicate — same email AND same role.
        const isUserPresent = await User.findOne({ email, role });
        if(isUserPresent){
            const error = createHttpError(400, `A ${role} account with this email already exists!`);
            return next(error);
        }


        const user = { name, phone, email, password, role };
        const newUser = User(user);
        await newUser.save();

        // Never send the password hash back to the client.
        newUser.password = undefined;

        res.status(201).json({success: true, message: "New user created!", data: newUser});


    } catch (error) {
        next(error);
    }
}


const login = async (req, res, next) => {

    try {
        
        const { email, password } = req.body;

        if(!email || !password) {
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        // Multiple role-accounts can share one email, so fetch all of them
        // and find the one whose password actually matches.
        const usersWithEmail = await User.find({email});
        if(!usersWithEmail.length){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        let matchedUser = null;
        for (const candidate of usersWithEmail) {
            const isMatch = await bcrypt.compare(password, candidate.password);
            if (isMatch) {
                matchedUser = candidate;
                break;
            }
        }

        if(!matchedUser){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const accessToken = jwt.sign({_id: matchedUser._id}, config.accessTokenSecret, {
            expiresIn : '1d'
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 *24 * 30,
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })

        // Never send the password hash back to the client.
        matchedUser.password = undefined;

        res.status(200).json({success: true, message: "User login successfully!", 
            data: matchedUser
        });


    } catch (error) {
        next(error);
    }

}

const getUserData = async (req, res, next) => {
    try {
        
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json({success: true, data: user});

    } catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {
        
        res.clearCookie('accessToken');
        res.status(200).json({success: true, message: "User logout successfully!"});

    } catch (error) {
        next(error);
    }
}




module.exports = { register, login, getUserData, logout }