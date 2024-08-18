import mongoose, { Document, Schema } from "mongoose";
import { INotification } from "../types/notificationInterfaces";


const notificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["like", "comment", "follow"], required: true },
  content: { type: String, required: true },
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
