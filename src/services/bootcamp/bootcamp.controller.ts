import path from "path";

import { Request, Response, NextFunction } from "express";
import { UploadedFile } from "express-fileupload";

import Bootcamp from "./bootcamp.model";
import ErrorResponse from "../../utils/ErrorResponse";
import asyncHandler from "../../middlewares/async";
import geocoder from "../../utils/geocoder";
import { Role } from "../users/user.interface";

class BootcampControllersClass {
  public find = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const bootcamp = await Bootcamp.findById(req.params.id);

      if (!bootcamp) {
        return next(
          new ErrorResponse(
            `Bootcamp not found with id of ${req.params.id}`,
            404
          )
        );
      }

      req.targetBootcamp = bootcamp;

      if (
        req.targetBootcamp.user.toString() !== req.user.id &&
        req.user.role !== Role.ADMIN
      ) {
        return next(
          new ErrorResponse(
            "User does not have the authorization to do changes",
            401
          )
        );
      }
      return next();
    }
  );
  public create = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      req.body.user = req.user.id;

      const existingBootcamp = await Bootcamp.findOne({ user: req.user.id });

      if (existingBootcamp && req.user.role !== Role.ADMIN) {
        return next(
          new ErrorResponse(
            `The user with the ID ${req.user.id} has already published a bootcamp`,
            400
          )
        );
      }
      const bootcamp = await Bootcamp.create(req.body);
      return res.status(201).json({ success: true, data: bootcamp });
    }
  );

  public list = asyncHandler(async (req: Request, res: Response) => {
    return res.json((<any>res).queryResults);
  });

  public show = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const bootcamp = await Bootcamp.findById(id);
      if (!bootcamp) {
        return next(
          new ErrorResponse(`Bootcamp not found with the id of ${id}`, 404)
        );
      }
      return res.json({ success: true, data: bootcamp });
    }
  );

  public update = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      Object.assign(req.targetBootcamp, req.body);

      await req.targetBootcamp.save();

      return res.json({ success: true, data: req.targetBootcamp });
    }
  );

  public destroy = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      await req.targetBootcamp.remove();
      return res.json({ success: true, data: {} });
    }
  );

  public listByRadius = asyncHandler(async (req: Request, res: Response) => {
    const { zipcode, distance } = req.params;
    const loc = await geocoder.geocode(zipcode);

    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //Earth radius = 3963 miles / 6378 km
    const radius = +distance / 3963;

    const bootcamps = await Bootcamp.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.json({ success: true, count: bootcamps.length, data: bootcamps });
  });

  public fileUpload = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const bootcamp = await Bootcamp.findById(id);
      if (!bootcamp) {
        return next(
          new ErrorResponse(`Bootcamp not found with the id of ${id}`, 404)
        );
      }

      if (!req.files) {
        return next(new ErrorResponse("Please upload a file", 400));
      }

      const { file } = req.files;

      if (!(<UploadedFile>file).mimetype.startsWith("image")) {
        return next(new ErrorResponse("Please upload an image file", 400));
      }

      if ((<UploadedFile>file).size > +process.env.MAX_FILE_UPLOAD!) {
        return next(
          new ErrorResponse(
            `Please upload an image file less than ${Math.floor(
              +process.env.MAX_FILE_UPLOAD!
            )}`,
            400
          )
        );
      }

      (<UploadedFile>file).name = `photo_${bootcamp.id}${
        path.parse((<UploadedFile>file).name).ext
      }`;

      (<UploadedFile>file).mv(
        `${process.env.FILE_UPLOAD_PATH}/${(<UploadedFile>file).name}`,
        async (err) => {
          if (err) {
            return next(new ErrorResponse("Problem with file upload", 500));
          }

          await Bootcamp.findByIdAndUpdate(id, {
            photo: (<UploadedFile>file).name,
          });

          res.json({ success: true, data: (<UploadedFile>file).name });
        }
      );
    }
  );
}

export const BootcampController = new BootcampControllersClass();

export default BootcampController;
