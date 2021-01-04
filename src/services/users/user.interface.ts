import { Document } from "mongoose";

export enum Role {
  USER = 1,
  PUBLISHER,
  ADMIN,
}

export interface IUser {
  name: string;
  password: string;
  email: string;
  role: Role;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
}

export interface IUserDocument extends Document, IUser {
  createdAt: Date;
  updatedAt: Date;
  getToken(): string;
  matchPassword(password: String): Promise<Boolean>;
  getResetPasswordToken(): string;
}
