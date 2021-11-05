const mongoose = require("mongoose");

const ProductImageScheme = new mongoose.SchemaType({
    product_image_id: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: Array,
        required: true,
    },
    product_id: {
        type: String,
        required: true,
    }
});

const product_images = mongoose.model("product_images", ProductImageScheme);