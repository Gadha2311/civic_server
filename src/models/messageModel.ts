
import mongoose, { Schema, Document } from "mongoose";
import {IMessage} from "../types/messageInterface"

const messageSchema = new Schema<IMessage>({
  chatId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Chat",
  },
  type: {
    type: String,
    required: true,
    default: "message",
    enum: ["message", "request"],
  },
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  imageUrl: [{ type: String }],
  content: {
    type: String,
    required: function () {
      return this.imageUrl?.length === 0;
    },
  },
  timeStamp: {
    type: Date,
    required: true,
    default: () => new Date().getTime(),
  },
  status: { type: Boolean, required: true, default: false },
  readAt: { type: Date },
  isDeleted: { type: Boolean, required: true, default: false },
});

export default mongoose.model<IMessage>("Message", messageSchema);
