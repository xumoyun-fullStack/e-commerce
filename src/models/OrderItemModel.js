const mongoose = require("mongoose");

const OrderItemScheme = new mongoose.Schema({
    order_item_id: {
        type: String,
        required: true,
        unique: true
    },
    product_id: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        required: true
    },
    order_id: {
        type: String,
        required: true,
    }
});

const order_items = mongoose.model("order_items", OrderItemScheme);

module.exports = order_items;