import mongoose from "mongoose";
import Blog from "../models/Blog";
import User from "../models/User";
import Comment from "../models/Comment";

export const getAllBlogs = async (req, res, next) => {
    let blogs;

    try {
        blogs = await Blog.find();
    } catch (error) {
        console.log(error);
    }

    if (false == blogs) {
        return res.status(200).json({ message: "No blogs found" });
    }

    return res.status(200).json({ blogs });
}

export const addBlog = async (req, res, next) => {
    const { title, description, image } = req.body;
    const signedUser = req.user;

    // let existingUser;
    // try {
    //     existingUser = await User.findById(user);
    // } catch (error) {
    //     return console.log(error);
    // }
    // if(false == existingUser) {
    //     return res.status(400).json({messgae: "Unable to find the user by this id."})
    // }

    const blog = new Blog({
        title,
        description,
        image,
        user: signedUser,
    });

    try {
        //const result = await blog.save();
        const session = await mongoose.startSession();
        session.startTransaction();
        await blog.save({ session });
        signedUser.blogs.push(blog);
        await signedUser.save({ session });
        await session.commitTransaction();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Sorry, we are unable to post your blog." });
    }

    return res.status(200).json({ message: "Blog posted successfully." });
}

export const updateBlog = async (req, res, next) => {
    const { title, description } = req.body;
    const blogId = req.params.id;
    const signedUser = req.user;

    let blog;
    try {
        blog = await Blog.findById(blogId);
    } catch (error) {
        console.log(error);
    }

    if (false == blog) {
        return res.status(500).json({ message: "Unable to find the blog to be updated." });
    }

    try {
        console.log(`${signedUser.id}  ?  ${blog.user}`);
        if (signedUser.id != blog.user) {
            return res.status(404).json({ message: "Failed to edit blog. Users can edit/update blogs posted by them only." });
        }

        await Blog.findByIdAndUpdate(blogId, {
            title,
            description
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Unable to update the blog due to internal errors. Please try again." });
    }

    return res.status(200).json({ blog });
}

export const getBlogById = async (req, res, next) => {
    const blogId = req.params.id;

    let blog;

    try {
        blog = await Blog.findById(blogId);
    } catch (error) {
        console.log(error);
    }

    if (false == blog) {
        return res.status(404).json({ message: "No blog found." });
    }

    return res.status(200).json({ blog });
}

export const deleteBlog = async (req, res, next) => {
    const blogId = req.params.id;
    const signedUser = req.user;

    let blog;
    try {
        blog = await Blog.findById(blogId);
    } catch (error) {
        console.log(error);
    }

    if (false == blog) {
        return res.status(500).json({ message: "Unable to find the blog to be deleted." });
    }

    try {
        if (signedUser.id != blog.user) {
            return res.status(404).json({ message: "Failed to delete blog. Users can delete blogs posted by them only." });
        }

        blog = await Blog.findByIdAndRemove(blogId).populate("user");
        await blog.user.blogs.pull(blog);
        await blog.user.save();
    } catch (error) {
        console.log(error);
    }

    if (false == blog) {
        return res.status(500).json({ messgae: "Unable to delete blog." });
    }
    return res.status(200).json({ messgae: "Successfully deleted blog." });
}

export const getBlogByUserId = async (req, res, next) => {
    const userId = req.params.id;
    if (userId == null) {
        return res.status(404).json({ message: "Unable to find blogs due to internal errors." });
    }

    let userBlogs;
    try {
        userBlogs = await User.findById(userId).populate("blogs");
    } catch (error) {
        console.log(error);
    }

    if (false == userBlogs) {
        return res.status(404).json({ messgae: "No blogs found for this user." });
    }
    return res.status(200).json({ userBlogs });
}

export const getMyBlogs = async (req, res, next) => {
    const signedUser = req.user;
    if (signedUser == null) {
        return res.status(404).json({ message: "Unable to find blogs due to internal errors." });
    }

    let userBlogs;
    try {
        userBlogs = signedUser.populate("blogs");
    } catch (error) {
        console.log(error);
        return res.status(404).json({ message: "Unable to find blogs due to internal errors." });
    }

    if (false == userBlogs) {
        return res.status(404).json({ messgae: "No blogs found for this user." });
    }
    return res.status(200).json({ Blogs: "userBlogs" });
}

export const likeBlog = async (req, res, next) => {
    const signedUser = req.user;
    const blogId = req.params.id;

    let blog;
    try {
        blog = await Blog.findById(blogId);
        blog.likes = blog.likes + 1;
        blog.likedBy.push(signedUser);
        await blog.save();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Couldn't like the blog." });
    }
    return res.status(200).json({ message: "Liked!!", blog });
}

export const commentOnBlog = async (req, res, next) => {
    const signedUser = req.user;
    const blogId = req.params.id;
    const { text } = req.body;
    if (text == null) {
        return res.status(400).json({ message: "Comment cannot be empty." });
    }

    let blog;
    try {
        const comment = new Comment({
            text,
            user: signedUser,
        });

        blog = await Blog.findById(blogId);
        blog.comments.push(comment);
        await blog.save();
    } catch (error) {
        console.log(`User failed to add comment. User: \n${signedUser} \n blogId: ${blogId}`);
        return res.status(400).json({ message: "Failed to add comment." });
    }

    let textComment;
    try {
        textComment = blog.comments[0].text;
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Failed to get text." });
    }
    return res.status(200).json({ message: "Added comment successfully!!!", comment: textComment });
}