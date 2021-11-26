const mongoose = require("mongoose");

const CommentDislikeSchema = new mongoose.Schema({
    dislike_id: {
        type: String,
        require: true,
        unique: true,
    },
    commentt_id: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    }
});

const comment_dislikes = mongoose.model("comment_dislikes", CommentDislikeSchema);

module.exports = comment_dislikes;