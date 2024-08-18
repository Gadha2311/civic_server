
import { Document } from "mongoose";

export interface INotification extends Document {
  userId: string;
  type: "like" | "comment" | "follow";
  content: string;
  postId: string;
  createdAt: Date;
}
