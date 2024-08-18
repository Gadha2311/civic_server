import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Notification from "../models/notificationModel";

interface DecodedToken {
  id: string;
}

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const secret = process.env.JWT_KEY;
    if (!secret) {
      console.error("JWT_KEY is not defined");
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    // Log token and secret for debugging
    console.log("Token:", token);
    console.log("Secret:", secret);

    // Verify and decode the token
    const decoded = jwt.verify(token, secret) as DecodedToken;
    console.log("Decoded:", decoded); // Add this line

    // Extract user ID from the decoded token
    const userId = decoded.id;

    // Fetch notifications for the user
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
};
