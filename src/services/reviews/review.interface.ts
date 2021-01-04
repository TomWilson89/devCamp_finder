import { Document } from "mongoose";

export interface IReview {
  title: string;
  text: string;
  rating: number;
  user: string;
  bootcamp: string;
}

export interface IReviewDocument extends Document, IReview {
  createdAt: Date;
  updatedAt: Date;
}
