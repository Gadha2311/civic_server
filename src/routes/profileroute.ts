import { Router } from "express";
import {
  uploadProfilePicture,
  updateProfileDetails,
  status,
  search,
  getUserProfile
} from "../controller/profilecontroller";
import { fileparser } from "../middleware/formidable";

const router = Router();

router.post("/uploadProfilePicture", fileparser, uploadProfilePicture);
router.put("/updateProfileDetails", updateProfileDetails);
router.patch("/updatestatus", status);
router.get("/search/:searchTerm", search);
router.get('/user/:userId', getUserProfile);

export default router;
