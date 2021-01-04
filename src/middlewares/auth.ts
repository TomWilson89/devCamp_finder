import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import asyncHander from "./async";
import ErrorResponse from "../utils/ErrorResponse";
import User from "../services/users/user.model";
import { Role } from "../services/users/user.interface";

class AuthMiddlewareClass {
  public protect = asyncHander(
    async (req: Request, res: Response, next: NextFunction) => {
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies.token) {
        token = req.cookies.token;
      }
      if (!token) {
        return next(new ErrorResponse("Not authorized", 401));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        req.user = await User.findById((<any>decoded).id);
        next();
      } catch (err) {
        return next(new ErrorResponse("Not authorized", 401));
      }
    }
  );

  public authorized = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorResponse(
            `User with role '${req.user.role}' is not authorized to access this route`,
            403
          )
        );
      }
      next();
    };
  };
}

export const AuthMiddleware = new AuthMiddlewareClass();

export default AuthMiddleware;
