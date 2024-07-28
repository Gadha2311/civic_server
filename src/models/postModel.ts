import mongoose, { Document, Schema } from "mongoose";

export interface PostDocument extends Document {
  userId: string;
  desc?: string;
  img?: string;
}

const postSchema: Schema<PostDocument> = new Schema(
  {
    userId: { type: String, required: true },
    desc: { type: String },

    img: { type: String },
  },
  { timestamps: true }
);

const PostModel = mongoose.model<PostDocument>("Post", postSchema);
export default PostModel;
