import { Schema, model } from "mongoose";
import slugify from "slugify";

import { IBootcampDocument } from "./bootcamp.interface";
import geocoder from "../../utils/geocoder";

const BootcampSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Name field is required"],
      unique: true,
      maxlength: [50, "name can not be mor ethan 50 characters long"],
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "Description field is required"],
      maxlength: [500, "Description can not be more than 500 character long"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please enter a valid url",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number can not be longet than 20 characters long"],
    },
    email: {
      type: String,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Address field is required"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: {
        type: String,
      },
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      zipcode: {
        type: String,
      },
      country: {
        type: String,
      },
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating can not be more than 10"],
    },
    averageCost: {
      type: Number,
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

BootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

BootcampSchema.pre<IBootcampDocument>("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

BootcampSchema.pre<IBootcampDocument>("remove", async function (next) {
  await this.model("Course").deleteMany({ bootcamp: this._id });
});

BootcampSchema.pre<IBootcampDocument>("save", async function (next) {
  const loc = await geocoder.geocode(this.address!);

  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // this.address = undefined;

  next();
});

export const Bootcamp = model<IBootcampDocument>("Bootcamp", BootcampSchema);

export default Bootcamp;
