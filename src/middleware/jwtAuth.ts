import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
}

export interface CustomRequest extends Request {
  currentUser?: { id: string };
}

const secretKey = 'secretkey123';

export const authenticateToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization
  

  if (!token) {
    return res.status(401).json('Token not provided');
  }

  76
  try {
    const decoded = jwt.verify(token, secretKey) as DecodedToken;
    req.currentUser = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(400).json('Invalid token');
  }
};