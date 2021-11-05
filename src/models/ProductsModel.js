const mongoose = require("mongoose");

const ProductScheme = new mongoose.SchemaType({
    product_id: {
        type: String,
        required: true,
        unique: true
    },
    product_name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category_id:{
        type: String,
        required: true,
    }

});

const products = mongoose.model("products", ProductScheme);