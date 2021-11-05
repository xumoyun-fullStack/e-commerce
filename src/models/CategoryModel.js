const mongoose = require("mongoose");

const CategoryScheme = new mongoose.SchemaType({
    category_id: {
        type: String,
        required: true,
        unique: true
    },
    category_name: {
        type: String,
        required: true,
    },
});

const categories = mongoose.model("categories", CategoryScheme);