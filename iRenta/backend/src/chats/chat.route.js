import express from "express";
import {
  getChatsForUser,
  getOrCreateChat,
  sendMessage,
} from "./chat.controller.js";
import requireAuth from "../../global/middlewares/RequireAuth.js"; // Auth middleware

const router = express.Router();

// Get all chats for the authenticated user
router.get("/", requireAuth, getChatsForUser);

// Get or create a chat between two users
router.post("/", requireAuth, getOrCreateChat);

// Send a message in a chat
router.post("/send", requireAuth, sendMessage);

export default router;
