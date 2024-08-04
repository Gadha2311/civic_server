import { Router } from "express";
import{
    createPost,
    getUserPosts,
    editPost,
    deletePost
} from "../controller/postController"

import { fileparser } from "../middleware/formidable";
import { getTimelinePost } from "../controller/authController";
const router = Router();

router.post("/createPost", fileparser, createPost);

router.get("/posts/:userId", getUserPosts);

router.put("/editpost/:postId", editPost);

router.delete("/deletepost/:postId", deletePost);
router.get("/getTimelinePost/:userId",getTimelinePost)

export default router;
