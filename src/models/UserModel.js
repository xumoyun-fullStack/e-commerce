const mongoose = require("mongoose");

const UserScheme = new mongoose.SchemaType({
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    is_verified:{
        type: Boolean,
        required: true,
        default: false
    }

});

const users = mongoose.model("users", UserScheme);