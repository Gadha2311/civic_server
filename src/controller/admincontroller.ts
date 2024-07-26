import { Request, Response } from "express";
import { UserModel } from "../models/userModel";

export const getAllUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserModel.find({ username: { $ne: 'Admin' } }, { password: 0 }).exec();
    res.status(200).json(users);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: String(error) });
    }
  }
};

export const blockuser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.params);
    await UserModel.findByIdAndUpdate(req.params.id, { $set: { blocked: true } }).exec();
    res.status(200).json("Account Blocked Successfully");
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: String(error) });
    }
  }
};

export const unblockuser = async (req: Request, res: Response): Promise<void> => {
  try {
    await UserModel.findByIdAndUpdate(req.params.id, { $set: { blocked: false } }).exec();
    res.status(200).json("Account UNBlocked Successfully");
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: String(error) });
    }
  }
};

export const deleteuser = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  console.log(id);
  try {
    await UserModel.findByIdAndDelete(id).exec();
    res.status(200).json("user Deleted");
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: String(error) });
    }
  }
};

export const edituser = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const { username, email } = req.body;
  console.log(username);

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: { username, email } },
      { new: true }
    ).exec();

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: String(error) });
    }
  }
};
