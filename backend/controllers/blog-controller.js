import mongoose from "mongoose";
import Blog from "../models/Blog";
import User from "../models/User";

export const getAllBlogs = async(req,res,next) => {
    let blogs;

    try {
        blogs = await Blog.find();
    } catch (error) {
        console.log(error);
    }

    if(false == blogs) {
        return res.status(200).json({message: "No blogs found"});
    }

    return res.status(200).json({blogs});
}

export const add = async(req,res,next) => {
    const {title, description, image, user} = req.body;

    let existingUser;
    try {
        existingUser = await User.findById(user);
    } catch (error) {
        return console.log(error);
    }
    if(false == existingUser) {
        return res.status(400).json({messgae: "Unable to find the user by this id."})
    }

    const blog = new Blog({
        title,
        description,
        image,
        user,
    });

    try {
        //const result = await blog.save();
        const session = await mongoose.startSession();
        session.startTransaction();
        await blog.save({session});
        existingUser.blogs.push(blog);
        await existingUser.save({session});
        await session.commitTransaction();
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error});
    }

    return res.status(200).json({blog});
}

export const updateBlog = async(req,res,next) => {
    const {title, description} = req.body;
    const blogId = req.params.id;

    let blog;
    try {
        blog = await Blog.findByIdAndUpdate(blogId, {
            title,
            description
        })
    } catch (error) {
        console.log(error);
    }

    if(false == blog) {
        return res.status(500).json({message: "Unable to update the blog."});
    }

    return res.status(200).json({blog});
}

export const getBlogById = async(req,res,next) => {
    const blogId = req.params.id;

    let blog;

    try {
        blog = await Blog.findById(blogId);
    } catch (error) {
        console.log(error);
    }

    if(false == blog) {
        return res.status(404).json({message: "No blog found."});
    }

    return res.status(200).json({blog});
}

export const deleteBlog = async(req,res,next) => {
    const blogId = req.params.id;
    
    let blog;
    try {
        blog = await Blog.findByIdAndRemove(blogId).populate("user");
        await blog.user.blogs.pull(blog);
        await blog.user.save();
    } catch (error) {
        console.log(error);
    }

    if(false == blog) {
        return res.status(500).json({messgae: "Unable to delete blog."});
    }
    return res.status(200).json({messgae: "Successfully deleted blog."});
}

export const getBlogByUserId = async(req,res,next) => {
    const userId = req.params.id;

    let userBlogs;
    try {
        userBlogs = await User.findById(userId).populate("blogs");
    } catch (error) {
        console.log(error);
    }

    if(false == userBlogs) {
        return res.status(404).json({messgae: "No blogs found for this user."});
    }
    return res.status(200).json({userBlogs});
}