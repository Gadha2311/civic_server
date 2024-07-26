import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel";
import formidable from "formidable";

interface ExtendedRequest extends Request {
  files?: {
    img: formidable.File;
  };
}
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_APIKEY,
  api_secret: process.env.CLOUD_APISECRET,
});

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

////////////////////////////////////////////uploadProfilePicture /////////////////////////////////////////////////////

export const uploadProfilePicture = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, "secretkey123") as DecodedToken;

    const image = (req as ExtendedRequest).files?.img;
    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    const imageUrl = await cloudinary.uploader.upload(image.filepath);

    const updatedUser = await UserModel.findByIdAndUpdate(
      decoded.id,
      { profilePicture: imageUrl.secure_url },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err });
  }
};

////////////////////////////////////////////updateProfileDetails/////////////////////////////////////////////////////

export const updateProfileDetails = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, "secretkey123") as DecodedToken;

    const { name, bio } = req.body;
    if (!name || !bio) {
      return res
        .status(400)
        .json({ message: "Please provide both name and bio" });
    }
    const username = name;

    const updatedUser = await UserModel.findByIdAndUpdate(
      decoded.id,
      { username, bio },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err });
  }
};

////////////////////////////////////////////Private/public/////////////////////////////////////////////////////
export const status = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, "secretkey123") as DecodedToken;

    const { isPrivate } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      decoded.id,
      { isPrivate },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err });
  }
};

////////////////////////////////////////////Search/////////////////////////////////////////////////////
export const search = async (req: Request, res: Response) => {
  try {
    const searchTerm = req.params.searchTerm.toLowerCase();
    const results = await UserModel.find(
      { username: new RegExp(searchTerm, "i") },
      "username _id email profilePicture isPrivate"
    );
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId).select('username email profilePicture isPrivate bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
