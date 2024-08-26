import { Router } from "express";

import { authenticateToken } from "../middleware/jwtAuth";
import {
  chats,
  createOrGetChat,
  getChatMessages,
  getMessagesByChatId,
  searchChat,
  sendMessage,
} from "../controller/messagecontroller";
import { fileparser } from "../middleware/formidable";

const router = Router();

router.get("/searchChat/:searchTerm", authenticateToken, searchChat);

router.get("/messages", authenticateToken, getChatMessages);

router.post("/sendMessage", fileparser,authenticateToken, sendMessage);
router.post("/createOrGetChat", authenticateToken, createOrGetChat);
router.get("/chat/:chatId/messages", authenticateToken, getMessagesByChatId);
router.get("/getUserChats", authenticateToken, chats);

export default router;
