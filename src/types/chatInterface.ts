
import mongoose, { ObjectId } from "mongoose";

export interface Ichat extends Document {
  participants: mongoose.Types.ObjectId[];
  type: "message" | "request";
  lastMessage: {
    messageId: ObjectId | null;
  };

  timeStamp: Date;
  status: boolean;
  readAt: Date;
  isDeleted: boolean;
}
