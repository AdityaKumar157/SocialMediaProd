import express from 'express';
import { add, deleteBlog, getAllBlogs, getBlogById, getBlogByUserId, updateBlog } from '../controllers/blog-controller';

const blogRouter = express.Router();

blogRouter.get("/", getAllBlogs);

blogRouter.post("/add", add);

blogRouter.put("/update/:id", updateBlog);

blogRouter.get("/:id", getBlogById);

blogRouter.delete("/:id", deleteBlog);

blogRouter.get("/user/:id", getBlogByUserId);

export default blogRouter;