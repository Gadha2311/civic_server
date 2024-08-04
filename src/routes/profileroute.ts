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

} from "../controller/profilecontroller";
import { fileparser } from "../middleware/formidable";

const router = Router();

router.post("/uploadProfilePicture", fileparser, uploadProfilePicture);
router.put("/updateProfileDetails", updateProfileDetails);
router.patch("/updatestatus", status);
router.get("/search/:searchTerm", search);
router.get('/users/:userId', getUserProfile);
router.put('/follow/:id',followUser)
router.put('/unfollow/:id',unfollowUser)
router.get("/getFollowing/:id",getFollowing)
router.get("/getFollowers/:id",getFollowers)
router.put("/blockuser/:userId", blockUser);
// router.put("/unblock/:Id", unblockUser);

export default router;
