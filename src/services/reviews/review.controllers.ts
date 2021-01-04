import { Request, Response, NextFunction } from "express";

import ErrorResponse from "../../utils/ErrorResponse";
import Review from "./review.model";
import Bootcamp from "../bootcamp/bootcamp.model";
import { Role } from "../users/user.interface";

import asyncHandler from "../../middlewares/async";

class ReviewControllerClass {
  public find = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const review = await Review.findById(req.params.id);

      if (!review) {
        return next(
          new ErrorResponse(
            ` No review found with the Id of ${req.params.id} `,
            404
          )
        );
      }

      req.targetReview = review;

      if (
        req.targetReview.user.toString() !== req.user.id &&
        req.user.role !== Role.ADMIN
      ) {
        return next(
          new ErrorResponse(` you have no authorization to make changes `, 401)
        );
      }

      return next();
    }
  );

  public list = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.params.bootcampId) {
        const review = await Review.find({ bootcamp: req.params.bootcampId });
        return res.json({
          success: true,
          count: review.length,
          data: review,
        });
      } else {
        res.json((<any>req).queryResults);
      }
    }
  );

  public show = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const review = await Review.findById(id).populate({
        path: "bootcamp",
        select: "name description",
      });

      if (!review) {
        return next(new ErrorResponse(`No review with the Id of ${id}`, 404));
      }
      res.json({
        success: true,
        data: review,
      });
    }
  );

  public create = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const bootcamp = await Bootcamp.findById(req.params.bootcampId);

      if (!bootcamp) {
        return next(
          new ErrorResponse(
            `No bootcamp found with the Id of ${req.params.bootcampId}`,
            404
          )
        );
      }
      req.body.user = req.user.id;
      req.body.bootcamp = req.params.bootcampId;

      const review = await Review.create(req.body);

      return res.status(201).json({
        success: true,
        data: review,
      });
    }
  );

  public update = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      Object.assign(req.targetReview, req.body);

      await req.targetReview.save();

      return res.json({
        success: true,
        data: req.targetReview,
      });
    }
  );

  public destroy = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      await req.targetReview.remove();

      return res.json({
        success: true,
        data: {},
      });
    }
  );
}

export const ReviewController = new ReviewControllerClass();

export default ReviewController;
