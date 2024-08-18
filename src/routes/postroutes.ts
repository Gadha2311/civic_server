import { Router } from "express";
import{
    createPost,
    getUserPosts,
    editPost,
    deletePost,
    createReport,
    likePost,
    addComment,
    deleteImage
} from "../controller/postController"
import { fileparser } from "../middleware/formidable";
import { getTimelinePost } from "../controller/authController";
import { authenticateToken } from "../middleware/jwtAuth";


const router = Router();

router.post("/createPost", fileparser, createPost);

router.get("/posts/:userId",authenticateToken, getUserPosts);

router.put("/editpost/:postId",fileparser, editPost);

router.delete("/deletepost/:postId",authenticateToken, deletePost);

router.get("/getTimelinePost/:userId",authenticateToken,getTimelinePost)

router.post('/reportpost/:postId',authenticateToken, createReport);

router.post('/likepost/:postId',authenticateToken, likePost);

router.post("/commentpost/:postId",authenticateToken, addComment);

router.post("/deleteimage/:postId",authenticateToken,deleteImage)

export default router;
