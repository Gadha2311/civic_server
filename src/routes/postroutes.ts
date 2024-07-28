import { Router } from "express";
import{
    createPost,
    getUserPosts,
    editPost,
    deletePost
} from "../controller/postController"

import { fileparser } from "../middleware/formidable";
const router = Router();

router.post("/createPost", fileparser, createPost);

router.get("/user/:userId", getUserPosts);

router.put("/edit/:postId", editPost);

router.delete("/delete/:postId", deletePost);

export default router;
