import { Request, Response } from "express";
import { UserModel } from "../models/userModel";
import { CustomRequest } from "../middleware/jwtAuth";
import Message from "../models/messageModel";
import Chat from "../models/chatModel";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_APIKEY,
  api_secret: process.env.CLOUD_APISECRET,
});
interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  profilePicture: string;
}

export const searchChat = async (req: CustomRequest, res: Response) => {
  try {
    const searchTerm = req.params.searchTerm.toLowerCase();
    const currentUserId = req.currentUser?.id;

    if (!searchTerm) {
      return res.json([]);
    }

    const currentUser: any = await UserModel.findById(currentUserId).select(
      "followers following"
    );
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const followers = await Promise.all(
      currentUser.followers.map((follower: any) =>
        UserModel.findById(
          typeof follower === "object" ? follower._id || follower.id : follower
        ).select("username profilePicture")
      )
    );

    const following = await Promise.all(
      currentUser.following.map((following: any) =>
        UserModel.findById(
          typeof following === "object"
            ? following._id || following.id
            : following
        ).select("username profilePicture")
      )
    );

    const uniqueUsers = new Map<string, any>();
    [...followers, ...following].forEach((user) => {
      if (user) {
        uniqueUsers.set(user._id.toString(), {
          _id: user._id,
          username: user.username,
          profilePicture: user.profilePicture,
        });
      }
    });

    const relevantUsers = Array.from(uniqueUsers.values()).filter((user) =>
      user.username.toLowerCase().includes(searchTerm)
    );

    res.json(relevantUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChatMessages = async (req: CustomRequest, res: Response) => {
  const { userId } = req.query;
  console.log(userId);
  const loggedInUserId = req.currentUser?.id;

  try {
    const user = await UserModel.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const { chatId, content } = req.body;
  const senderId = req.body.senderId;
  const image = (req as any).files?.image; // Adjusted to handle single image or array of images

  try {
    let imageUrl: any = "";
    if (image) {
      if (Array.isArray(image)) {
        imageUrl = await Promise.all(
          image.map(async (img: any) => {
            const result = await cloudinary.v2.uploader.upload(img.filepath);
            return result.secure_url;
          })
        );
      } else {
        const result = await cloudinary.v2.uploader.upload(image.filepath);
        imageUrl = result.secure_url;
      }
    }

    const newMessage = new Message({
      chatId,
      senderId,
      content,
      imageUrl,
      timeStamp: new Date(),
      status: false,
      isDeleted: false,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const createOrGetChat = async (req: CustomRequest, res: Response) => {
  try {
    const { selectedUserId } = req.body;
    const userId = req.currentUser?.id;

    if (!userId || !selectedUserId) {
      return res
        .status(400)
        .json({ error: "User ID and selectedUserId are required" });
    }
    let chat = await Chat.findOne({
      participants: { $all: [userId, selectedUserId] },
    });

    console.log(chat);

    if (!chat) {
      chat = new Chat({
        participants: [userId, selectedUserId],
        type: "message",
        lastMessage: { messageId: null },
        timeStamp: new Date(),
        status: false,
        readAt: null,
        isDeleted: false,
      });

      await chat.save();
    } else {
      const latestMessage: any = await Message.findOne({ chatId: chat._id })
        .sort({ timeStamp: -1 })
        .select("_id");

      if (latestMessage) {
        chat.lastMessage.messageId = latestMessage._id;
        await chat.save();
      }
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error creating or fetching chat:", error);
    res.status(500).json({ error: "Failed to create or get chat" });
  }
};

export const getMessagesByChatId = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chatId }).sort({ timeStamp: 1 });

    if (!messages) {
      return res.status(404).json({ message: "Messages not found" });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const chats = async (req: CustomRequest, res: Response) => {
  try {
    const currentUserId = req.currentUser?.id;

    const chats = await Chat.find({
      participants: currentUserId,
    }).populate("participants", "_id username profilePicture", "users");

    const users = chats
      .map((chat) => {
        const participants = chat.participants as unknown as IUser[];
        return participants.find(
          (participant) => participant._id.toString() !== currentUserId
        );
      })
      .filter(Boolean);

    res.json(users);
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ message: "Error fetching user chats" });
  }
};
