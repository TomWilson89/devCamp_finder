import crypto from "crypto";

import { Request, Response, NextFunction } from "express";

import ErrorResponse from "../../utils/ErrorResponse";
import asyncHandler from "../../middlewares/async";
import User from "../users/user.model";
import { IUserDocument } from "../users/user.interface";
import sendEmail from "../../utils/sendEmail";

class AuthControllerClass {
  private sendToken = (
    user: IUserDocument,
    statusCode: number,
    res: Response
  ) => {
    const token = user.getToken();

    const options = {
      expires: new Date(
        Date.now() + +process.env.JWT_COOKIE_EXPIRE! * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: false,
    };

    if (process.env.NODE_ENV === "production") {
      options.secure = true;
    }

    res
      .status(statusCode)
      .cookie("token", token, options)
      .json({ success: true, data: token });
  };

  public register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.body.role === 3) {
        return next(new ErrorResponse("Not authorized", 403));
      }
      const user = await User.create(req.body);

      this.sendToken(user, 200, res);
    }
  );

  public login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(
          new ErrorResponse("Please enter a valid email & password", 400)
        );
      }

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorResponse("Invalid credentials", 401));
      }

      if (!(await user.matchPassword(password))) {
        return next(new ErrorResponse("Invalid credentials", 401));
      }

      this.sendToken(user, 200, res);
    }
  );

  public me = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findById(req.user.id);

      res.json({
        success: true,
        data: user,
      });
    }
  );

  public update = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findById(req.user.id).select("+password");

      const fields: any = {
        name: req.body.name,
        email: req.body.email,
      };

      if (
        req.body.currentPassword &&
        !(await user?.matchPassword(req.body.currentPassword))
      ) {
        return next(new ErrorResponse(" Password is incorrect ", 401));
      }

      if (
        req.body.currentPassword &&
        (await user?.matchPassword(req.body.currentPassword))
      ) {
        fields.password = req.body.newPassword;
      }

      Object.assign(user, fields);

      await user?.save();

      res.json({
        success: true,
        data: req.user,
      });
    }
  );

  public forgotPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return next(
          new ErrorResponse(`No user with the email ${req.body.email}`, 404)
        );
      }

      const resetToken = user.getResetPasswordToken();

      await user.save({ validateBeforeSave: false });

      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/resetpassword/${resetToken}`;

      const message = `You are recieveing this email because you ( or someone) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
      try {
        await sendEmail({
          email: user.email,
          subject: "Password reset token",
          message,
        });

        res.json({
          success: true,
          data: "Email sent",
        });
      } catch (err) {
        console.log(err);
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;

        return next(new ErrorResponse("Email could not be sent", 500));
      }
    }
  );
  public resetPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: new Date(Date.now()) },
      });

      if (!user) {
        return next(new ErrorResponse("Invalid Token", 400));
      }

      user.password = req.body.password;

      user.resetPasswordExpire = undefined;
      user.resetPasswordToken = undefined;

      await user.save();

      this.sendToken(user, 200, res);
    }
  );
}

export const AuthController = new AuthControllerClass();

export default AuthController;
