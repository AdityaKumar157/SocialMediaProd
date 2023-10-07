import mongoose from "mongoose";

const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    likedBy: [{
        type: mongoose.Types.ObjectId,
        ref: "User",
    }],
    comments: [{
        type: mongoose.Types.ObjectId,
        ref: "Comment",
    }],
});

const Blog = new mongoose.model("Blog", blogSchema);
export default Blog;