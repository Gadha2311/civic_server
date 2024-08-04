import mongoose, { Document, Schema } from "mongoose";

export interface PostDocument extends Document {
  userId: string;
  desc?: string;
  img?: string[];
  Username?: string;
  profilepic?: string;
  createdAt: Date;
}


const postSchema: Schema<PostDocument> = new Schema(
  {
    userId: { type: String, required: true },
    Username: { type: String },
    desc: { type: String },

    img: [{ type: String }],
    profilepic: { type: String },
  },
  { timestamps: true }
);

const PostModel = mongoose.model<PostDocument>("Post", postSchema);
export default PostModel;
