import { Router } from "express";
import {
  uploadProfilePicture,
  updateProfileDetails,
  status,
  search,
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  blockUser,
  unblockUser,

} from "../controller/profilecontroller";
import { fileparser } from "../middleware/formidable";
import { authenticateToken } from "../middleware/jwtAuth";

const router = Router();

router.post("/uploadProfilePicture", fileparser, uploadProfilePicture);
router.put("/updateProfileDetails",authenticateToken, updateProfileDetails);
router.patch("/updatestatus",authenticateToken,status);
router.get("/search/:searchTerm", search);
router.get('/users/:userId', getUserProfile);
router.put('/follow/:id',authenticateToken,followUser)
router.put('/unfollow/:id',authenticateToken,unfollowUser)
router.get("/getFollowing/:id",getFollowing)
router.get("/getFollowers/:id",getFollowers)
router.put("/blockuser/:userId",authenticateToken, blockUser);
router.put("/unblockuser/:userId",authenticateToken, unblockUser);

export default router;
