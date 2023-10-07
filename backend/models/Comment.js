import mongoose from "mongoose";
import User from "./User";

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: User,
        required: true,
    },
});

const Comment = new mongoose.model("Comment", commentSchema);
export default Comment;