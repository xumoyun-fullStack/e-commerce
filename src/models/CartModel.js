const mongoose = require("mongoose");

const CartScheme = new mongoose.Schema({
    cart_id: {
        type: String,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    product_id: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    }
});

const carts = mongoose.model("carts", CartScheme);

module.exports = carts;