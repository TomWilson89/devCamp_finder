import { Schema, model } from "mongoose";
import { IReviewDocument } from "./review.interface";

const ReviewSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title for the review"],
      trim: true,
      maxlength: 100,
    },
    text: {
      type: String,
      required: [true, "Please add text for your review"],
    },
    rating: {
      type: Number,
      required: [true, "Please add a rating from 1 to 10"],
      min: 1,
      max: 10,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bootcamp: {
      type: Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
  },
  { timestamps: true }
);

// ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

ReviewSchema.statics.getAverageRating = async function (
  bootcampId: Schema.Types.ObjectId
) {
  const list = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(list);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: list[0].averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

ReviewSchema.pre<IReviewDocument>("save", function (this: any) {
  this.constructor.getAverageRating(this.bootcamp);
});
ReviewSchema.pre<IReviewDocument>("remove", function (this: any) {
  this.constructor.getAverageRating(this.bootcamp);
});

export const Review = model<IReviewDocument>("Review", ReviewSchema);

export default Review;
