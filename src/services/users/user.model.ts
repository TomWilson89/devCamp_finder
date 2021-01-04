import crypto from "crypto";

import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role, IUserDocument } from "./user.interface";
import { NextFunction } from "express";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name field is required"],
    },
    password: {
      type: String,
      required: [true, "Password field is required"],
      minlength: 6,
      select: false,
    },
    email: {
      type: String,
      required: [true, "Email field is required"],
      unique: true,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    role: {
      type: Number,
      enum: Object.keys(Role)
        .filter((role) => !isNaN(Number(role)))
        .map((role) => Number(role)),
      default: Role.USER,
    },

    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (this: any, next: any) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getToken = function (this: IUserDocument) {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.getResetPasswordToken = function (this: IUserDocument) {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

UserSchema.methods.matchPassword = async function (
  this: IUserDocument,
  password: string
) {
  return await bcrypt.compare(password, this.password);
};

export const User = model<IUserDocument>("User", UserSchema);

export default User;
