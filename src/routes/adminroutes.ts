import express from "express";
import {
  getAllUser,
  blockuser,
  unblockuser,
  deleteuser,
  edituser,
} from "../controller/admincontroller";

const router = express.Router();

router.get("/userlist", getAllUser);
router.put("/block/:id", blockuser);
router.put("/unblock/:id", unblockuser);
router.delete("/deleteuser/:id", deleteuser);
router.put("/edituser/:id", edituser);

export default router;
