import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import formidable, { File } from "formidable";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import PostModel, { PostDocument } from "../models/postModel";
import { UserModel } from "../models/userModel";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_APIKEY,
  api_secret: process.env.CLOUD_APISECRET,
});

interface DecodedToken {
  id: string;
}

interface ExtendedRequest extends Request {
  files?: any;
}

export const createPost = async (
  req: ExtendedRequest,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const decoded = jwt.decode(token) as DecodedToken;
    req.body.userId = decoded.id;
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    req.body.username = user.username;
    req.body.userProfilePicture = user.profilePicture;

    const images = req.files;
    console.log(images);

    if (images) {
      const imageUrls = await Promise.all((images.img as File[]).map((image: File) => cloudinary.v2.uploader.upload(image.filepath)));
      req.body.img = imageUrls.map((imageUrl) => imageUrl.secure_url);
    }

    const newPost = new PostModel(req.body);
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

export const getUserPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const posts: PostDocument[] = await PostModel.find({
      userId: req.params.userId,
    });   
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

export const editPost = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.decode(token) as DecodedToken;
    const postId = req.params.postId;
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== decoded.id) {
      return res
        .status(403)
        .json({ message: "You can only edit your own posts" });
    }

    await post.updateOne({ $set: { desc: req.body.desc } });
    res.status(200).json("Post updated");
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.decode(token) as DecodedToken;
    const postId = req.params.postId;
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== decoded.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();
    res.status(200).json("Post deleted");
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};
