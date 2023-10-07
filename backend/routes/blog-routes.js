import express from 'express';
import { addBlog, commentOnBlog, deleteBlog, getAllBlogs, getBlogById, getBlogByUserId, getMyBlogs, likeBlog, updateBlog } from '../controllers/blog-controller';
import { auth } from '../middleware/auth';

const blogRouter = express.Router();

blogRouter.get("/", auth, getAllBlogs);

blogRouter.post("/add", auth, addBlog);

blogRouter.put("/update/:id", auth, updateBlog);

blogRouter.get("/:id", auth, getBlogById);

blogRouter.delete("/:id", auth, deleteBlog);

blogRouter.get("/user/:id",auth, getBlogByUserId);

blogRouter.get("/myBlogs", auth, getMyBlogs);

blogRouter.put("/like/:id", auth, likeBlog);

blogRouter.put("/addComment/:id", auth, commentOnBlog);

export default blogRouter;