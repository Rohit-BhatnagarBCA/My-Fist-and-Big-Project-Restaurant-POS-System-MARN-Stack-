const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },

    email : {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /\S+@\S+\.\S+/.test(v);
            },
            message : "Email must be in valid format!"
        }
    },

    phone: {
        type : Number,
        required: true,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v);
            },
            message : "Phone number must be a 10-digit number!"
        }
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        required: true
    },

    // Subscription / billing info. Set only once payment succeeds — a User
    // document is only ever created after a successful payment now.
    subscription: {
        plan: { type: String, default: null },       // "Basic" | "Pro" | "Staff"
        duration: { type: String, default: null },   // "Monthly" | "4-Month" | "Yearly"
        amountPaid: { type: Number, default: 0 },
        startDate: { type: Date, default: null },
        expiryDate: { type: Date, default: null },
        // Set only for Waiter/Kitchen accounts registered under the SAME
        // email as a paying Admin — their access rides on that Admin's
        // subscription instead of carrying their own expiry.
        linkedAdminEmail: { type: String, default: null }
    }
}, { timestamps : true })

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

module.exports = mongoose.model("User", userSchema);