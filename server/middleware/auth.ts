import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  console.log(`[AUTH] ${req.method} ${req.path} - Token present: ${!!token}`);

  if (!token) {
    console.log(`[AUTH] No token provided for ${req.method} ${req.path}`);
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    console.log(`[AUTH] Token decoded successfully for user: ${decoded.userId}`);
    
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      console.log(`[AUTH] User not found in database: ${decoded.userId}`);
      return res.status(401).json({ message: "User not found" });
    }
    
    console.log(`[AUTH] User authenticated: ${user.id} (${user.userType})`);
    req.user = user;
    next();
  } catch (error) {
    console.log(`[AUTH] Token verification failed:`, error);
    return res.status(403).json({ message: "Invalid token" });
  }
};