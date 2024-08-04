import dotenv from "dotenv";
import cloudinary from "cloudinary";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel";
import formidable from "formidable";
import fs from "fs";

interface ExtendedRequest extends Request {
  files?: {
    img: formidable.File;
  };
}

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_APIKEY,
  api_secret: process.env.CLOUD_APISECRET,
});

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

////////////////////////////////////////////uploadProfilePicture/////////////////////////////////////////////////////

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

    const image = req.files?.img;
    if (!image || !Array.isArray(image) || image.length === 0) {
      return res.status(400).json({ message: "No image provided" });
    }
    const filePath = image[0].filepath;
    console.log("File path:", filePath);
    const imageUrl = await cloudinary.v2.uploader.upload(filePath);
    console.log("Image URL:", imageUrl.secure_url);

    fs.unlinkSync(filePath);

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

////////////////////////////////////////////status (Private/public)/////////////////////////////////////////////////////

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

////////////////////////////////////////////search/////////////////////////////////////////////////////

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

////////////////////////////////////////////getUserProfile/////////////////////////////////////////////////////

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId).select(
      "username email profilePicture isPrivate bio followers following"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

////////////////////////////////////////////followUser/////////////////////////////////////////////////////

export const followUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id: string = req.params.id;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json("Token not provided");
    return;
  }

  let currentUserId: string;

  try {
    const decoded = jwt.verify(token, "secretkey123") as DecodedToken;
    currentUserId = decoded.id;
  } catch (err) {
    res.status(400).json("Invalid token");
    return;
  }

  if (currentUserId === id) {
    res.status(403).json("Request forbidden");
    return;
  }

  try {
    const followUser = await UserModel.findById(id);
    const followingUser = await UserModel.findById(currentUserId);

    if (!followUser || !followingUser) {
      res.status(404).json("User not found");
      return;
    }

    followUser.followers = followUser.followers ?? [];
    followingUser.following = followingUser.following ?? [];

    if (!followUser.followers.includes(currentUserId)) {
      await followUser.updateOne({ $push: { followers: currentUserId } });
      await followingUser.updateOne({ $push: { following: id } });
      res.status(200).json("User Followed");
    } else {
      res.status(403).json("User is already being followed");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

////////////////////////////////////////////unfollowUser/////////////////////////////////////////////////////

export const unfollowUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  const { id: userId } = req.params;

  if (!token) {
    res.status(401).json("Token not provided");
    return;
  }

  try {
    const decoded = jwt.verify(token, "secretkey123") as DecodedToken;
    const currentUserId = decoded.id;

    if (currentUserId === userId) {
      res.status(403).json("You can't unfollow yourself");
      return;
    }

    const user = await UserModel.findById(userId);
    const currentUser = await UserModel.findById(currentUserId);

    if (!user || !currentUser) {
      res.status(404).json("User not found");
      return;
    }

    user.followers = user.followers ?? [];
    currentUser.following = currentUser.following ?? [];

    if (user.followers.includes(currentUserId)) {
      await user.updateOne({ $pull: { followers: currentUserId } });
      await currentUser.updateOne({ $pull: { following: userId } });
      res.status(200).json("User has been unfollowed");
    } else {
      res.status(403).json("You are not following this user");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

///////////////////////////////////////////getFollowing///////////////////////////////////////////////
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user || !user.following) {
      res.status(404).json({ message: "User not found or no following" });
      return;
    }

    const following = await Promise.all(
      user.following.map((followingId: string) =>
        UserModel.findById(followingId)
      )
    );

    const followingList = following
      .filter((following) => following != null)
      .map((following) => ({
        _id: following!._id,
        username: following!.username,
        profilePicture: following!.profilePicture,
      }));

    res.status(200).json(followingList);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

///////////////////////////////////////////getFollowers///////////////////////////////////////////////
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user || !user.followers) {
      res.status(404).json({ message: "User not found or no followers" });
      return;
    }

    const followers = await Promise.all(
      user.followers.map((followerId: string) => UserModel.findById(followerId))
    );

    const followerList = followers
      .filter((follower) => follower != null)
      .map((follower) => ({
        _id: follower!._id,
        username: follower!.username,
        profilePicture: follower!.profilePicture,
      }));

    res.status(200).json(followerList);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

////////////////////////////////////////////blockUser/////////////////////////////////////////////////////

export const blockUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, "secretkey123") as DecodedToken;
    const currentUserId = decoded.id;
    const { userId } = req.params;

    if (currentUserId === userId) {
      return res.status(403).json({ message: "You cannot block yourself" });
    }
    const currentUser = await UserModel.findById(currentUserId);
    const userToBlock = await UserModel.findById(userId);

    if (!currentUser || !userToBlock) {
      return res.status(404).json({ message: "User not found" });
    }
    if (currentUser.blockedUsers?.includes(userId)) {
      return res.status(400).json({ message: "User is already blocked" });
    }

    currentUser.blockedUsers?.push(userId);
    userToBlock.blockedMe?.push(currentUserId);

    await currentUser.save();
    await userToBlock.save();

    res.status(200).json({ message: "User blocked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err });
  }
};

// ////////////////////////////////////////////unblockUser/////////////////////////////////////////////////////

// export const unblockUser = async (req: Request, res: Response) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const decoded = jwt.verify(token, "secretkey123") as DecodedToken;
//     const currentUserId = decoded.id;
//     const { userId } = req.params;

//     if (currentUserId === userId) {
//       return res.status(403).json({ message: "You cannot unblock yourself" });
//     }

//     const userToUnblock = await UserModel.findById(userId);
//     if (!userToUnblock) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     userToUnblock.blocked = false;
//     await userToUnblock.save();

//     res.status(200).json({ message: "User unblocked successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error", error: err });
//   }
// };
