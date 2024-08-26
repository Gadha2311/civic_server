import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  type: "message" | "request";
  senderId: mongoose.Types.ObjectId;
  content: string;
  imageUrl?: string[];
  timeStamp: Date;
  status: boolean;
  readAt: Date;
  isDeleted: boolean;
  
}
