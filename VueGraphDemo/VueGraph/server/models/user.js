const mongoose = require("mongoose");
const md5 = require("md5");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    favorites: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        ref: "post"
    }
});

// Create and add avatar to user
userSchema.pre("save", function (next) {
    this.avatar = `https://gravatar.com/avatar/${md5(this.userName)}?d=identicon`;
    next();
});

// Hash password
userSchema.pre("save", function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(this.password, salt, (err2, hash) => {
            if (err2) return next(err);
            this.password = hash;
            return next();
        });
    });
});

module.exports = mongoose.model("User", userSchema);