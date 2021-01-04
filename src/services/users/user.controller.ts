import { Request, Response, NextFunction } from "express";

import ErrorResponse from "../../utils/ErrorResponse";
import asyncHandler from "../../middlewares/async";
import User from "./user.model";

class UserControllerClass {
  public list = asyncHandler(async (req: Request, res: Response) => {
    return res.json((<any>req).queryResults);
  });

  public show = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(new ErrorResponse("User not found", 404));
      }
      return res.json({ success: true, data: user });
    }
  );

  public create = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.create(req.body);

    return res.json({
      success: true,
      data: user,
    });
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.json({
      success: true,
      data: user,
    });
  });

  public destroy = asyncHandler(async (req: Request, res: Response) => {
    await User.findByIdAndRemove(req.params.id);

    res.json({ success: true, data: {} });
  });
}

export const UserController = new UserControllerClass();

export default UserController;
