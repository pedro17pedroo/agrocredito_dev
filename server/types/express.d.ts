import { User } from "../../shared/schema.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}