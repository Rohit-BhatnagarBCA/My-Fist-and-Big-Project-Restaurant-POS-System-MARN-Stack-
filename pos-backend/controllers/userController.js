const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");


// ======================================================
// REGISTER
// ======================================================

const register = async (req, res, next) => {
    try {

        const {
            name,
            phone,
            email,
            password,
            role
        } = req.body;

        if (
            !name ||
            !phone ||
            !email ||
            !password ||
            !role
        ) {
            return next(
                createHttpError(400, "All fields are required!")
            );
        }

        const isUserPresent = await User.findOne({
            email,
            role
        });

        if (isUserPresent) {
            return next(
                createHttpError(
                    400,
                    `A ${role} account with this email already exists!`
                )
            );
        }

        const user = new User({
            name,
            phone,
            email,
            password,
            role
        });

        await user.save();

        user.password = undefined;

        res.status(201).json({
            success: true,
            message: "New user created!",
            data: user
        });

    } catch (error) {
        next(error);
    }
};


// ======================================================
// LOGIN
// ======================================================

const login = async (req, res, next) => {
    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return next(
                createHttpError(
                    400,
                    "All fields are required!"
                )
            );
        }

        const usersWithEmail = await User.find({
            email
        });

        if (!usersWithEmail.length) {
            return next(
                createHttpError(
                    401,
                    "Invalid Credentials"
                )
            );
        }

        let matchedUser = null;

        for (const candidate of usersWithEmail) {

            const isMatch = await bcrypt.compare(
                password,
                candidate.password
            );

            if (isMatch) {
                matchedUser = candidate;
                break;
            }
        }

        if (!matchedUser) {
            return next(
                createHttpError(
                    401,
                    "Invalid Credentials"
                )
            );
        }

        // Subscription is NOT checked during login.
        // User can login first and subscription can
        // be managed separately.

        const accessToken = jwt.sign(
            {
                _id: matchedUser._id
            },
            config.accessTokenSecret,
            {
                expiresIn: "1d"
            }
        );

        res.cookie(
            "accessToken",
            accessToken,
            {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
                sameSite: "none",
                secure: true
            }
        );

        matchedUser.password = undefined;

        res.status(200).json({
            success: true,
            message: "User login successfully!",
            data: matchedUser
        });

    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET CURRENT USER
// ======================================================

const getUserData = async (req, res, next) => {
    try {

        const user = await User
            .findById(req.user._id)
            .select("-password");

        if (!user) {
            return next(
                createHttpError(
                    404,
                    "User not found!"
                )
            );
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
};


// ======================================================
// LOGOUT
// ======================================================

const logout = async (req, res, next) => {
    try {

        res.clearCookie(
            "accessToken",
            {
                httpOnly: true,
                sameSite: "none",
                secure: true
            }
        );

        res.status(200).json({
            success: true,
            message: "User logout successfully!"
        });

    } catch (error) {
        next(error);
    }
};


// ======================================================
// ADMIN — GET ALL USERS
// ======================================================

const getAllUsers = async (req, res, next) => {
    try {

        const users = await User
            .find({})
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        next(error);
    }
};


// ======================================================
// ADMIN — UPDATE USER SUBSCRIPTION
// ======================================================
//
// Admin can manually:
// - Activate subscription
// - Disable subscription
// - Set expiry date
//
// Body:
//
// {
//     "isActive": true,
//     "expiryDate": "2027-08-18"
// }
//
// OR:
//
// {
//     "isActive": false
// }
//

const updateUserSubscription = async (req, res, next) => {
    try {

        const { id } = req.params;
        const {
            isActive,
            expiryDate
        } = req.body;


        // --------------------------------------------------
        // Basic ObjectId validation
        // --------------------------------------------------

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return next(
                createHttpError(
                    400,
                    "Invalid user ID!"
                )
            );
        }


        // --------------------------------------------------
        // Admin cannot disable their own subscription
        // accidentally.
        // --------------------------------------------------

        if (
            req.user._id.toString() === id &&
            isActive === false
        ) {
            return next(
                createHttpError(
                    400,
                    "You cannot disable your own Admin subscription!"
                )
            );
        }


        // --------------------------------------------------
        // Validate isActive
        // --------------------------------------------------

        if (typeof isActive !== "boolean") {
            return next(
                createHttpError(
                    400,
                    "isActive must be true or false!"
                )
            );
        }


        const user = await User.findById(id);

        if (!user) {
            return next(
                createHttpError(
                    404,
                    "User not found!"
                )
            );
        }


        // --------------------------------------------------
        // DISABLE SUBSCRIPTION
        // --------------------------------------------------

        if (isActive === false) {

            user.subscription = {
                ...(user.subscription?.toObject
                    ? user.subscription.toObject()
                    : user.subscription || {}),

                startDate: null,
                expiryDate: new Date(0),
                amountPaid:
                    user.subscription?.amountPaid || 0
            };

            await user.save();

            const safeUser = user.toObject();
            delete safeUser.password;

            return res.status(200).json({
                success: true,
                message: "Subscription disabled successfully!",
                data: safeUser
            });
        }


        // --------------------------------------------------
        // ACTIVATE SUBSCRIPTION
        // --------------------------------------------------

        let newExpiryDate;

        if (expiryDate) {

            newExpiryDate = new Date(expiryDate);

            if (Number.isNaN(newExpiryDate.getTime())) {
                return next(
                    createHttpError(
                        400,
                        "Invalid expiry date!"
                    )
                );
            }

            if (newExpiryDate <= new Date()) {
                return next(
                    createHttpError(
                        400,
                        "Expiry date must be in the future!"
                    )
                );
            }

        } else {

            // If Admin does not provide expiry,
            // give 30 days from now.
            newExpiryDate = new Date();

            newExpiryDate.setDate(
                newExpiryDate.getDate() + 30
            );
        }


        user.subscription = {
            ...(user.subscription?.toObject
                ? user.subscription.toObject()
                : user.subscription || {}),

            startDate:
                user.subscription?.startDate ||
                new Date(),

            expiryDate: newExpiryDate
        };


        await user.save();


        const safeUser = user.toObject();
        delete safeUser.password;


        res.status(200).json({
            success: true,
            message: "Subscription activated successfully!",
            data: safeUser
        });

    } catch (error) {
        next(error);
    }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    register,
    login,
    getUserData,
    logout,
    getAllUsers,
    updateUserSubscription
};