
import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  bio: string;
  profilePicture?: string;
  blocked?: boolean;
  following?: string[];
  followers?: string[];
  blockedUsers?: string[];
  isAdmin?: boolean;
  isVerified?: boolean;
  isPrivate?: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  blockedMe?: string[];
}
