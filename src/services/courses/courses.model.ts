import { Schema, model } from "mongoose";
import { ICourseDocument, Skill } from "./courses.interface";

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title Field Is Required"],
    },
    description: {
      type: String,
      required: [true, "Description Field Is Required"],
    },
    weeks: {
      type: String,
      required: [true, "Number Of Field Is Required"],
    },
    tuition: {
      type: Number,
      required: [true, "Tuition Field Is Required"],
    },
    minimumSkill: {
      type: Number,
      enum: Object.keys(Skill)
        .filter((skill) => !isNaN(Number(skill)))
        .map((skill) => Number(skill)),
      required: [true, "Minimum Skill Field Is Required"],
    },
    schoolarship: {
      type: Boolean,
      default: false,
    },
    bootcamp: {
      type: Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

CourseSchema.statics.getAverageCost = async function (
  bootcampId: Schema.Types.ObjectId
) {
  const list = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(list[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.error(err);
  }
};

CourseSchema.post<ICourseDocument>("save", function (this: any) {
  this.constructor.getAverageCost(this.bootcamp);
});

CourseSchema.pre("remove", function (this: any) {
  this.constructor.getAverageCost(this.bootcamp);
});

export const Course = model<ICourseDocument>("Course", CourseSchema);

export default Course;
