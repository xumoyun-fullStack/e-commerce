const mongoose = require("mongoose");

const CommentScheme = new mongoose.SchemaType({
    comment_id: {
        type: String,
        required: true,
        unique: true
    },
    text: {
        type: String,
        required: true,
    },
    star: {
        type: Number,
        required: true,
        min: 1,
        max: 5
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

const comments = mongoose.model("commnets", CommentScheme);