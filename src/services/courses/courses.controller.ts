import { Request, Response, NextFunction } from "express";

import ErrorResponse from "../../utils/ErrorResponse";
import Bootcamp from "../bootcamp/bootcamp.model";
import asyncHanlder from "../../middlewares/async";
import Course from "./courses.model";
import { Role } from "../users/user.interface";

class CourseControllerClass {
  public find = asyncHanlder(
    async (req: Request, res: Response, next: NextFunction) => {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return next(
          new ErrorResponse(
            `Course not found with the Id of ${req.params.id}`,
            404
          )
        );
      }

      req.targetCourse = course;

      if (
        req.targetCourse.user.toString() !== req.user.id &&
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
  public create = asyncHanlder(
    async (req: Request, res: Response, next: NextFunction) => {
      const { bootcampId } = req.params;
      req.body.bootcamp = bootcampId;
      req.body.user = req.user.id;

      const bootcamp = await Bootcamp.findById(bootcampId);

      if (!bootcamp) {
        return next(
          new ErrorResponse(
            `No Bootcamp Found With The Id of ${bootcampId}`,
            404
          )
        );
      }
      const course = await Course.create(req.body);

      res.status(201).json({ success: true, data: course });
    }
  );

  public list = asyncHanlder(async (req: Request, res: Response) => {
    if (req.params.bootcampId) {
      const courses = await Course.find({ bootcamp: req.params.bootcampId });
      return res.json({
        success: true,
        count: courses.length,
        data: courses,
      });
    } else {
      return res.json((<any>res).queryResults);
    }
  });

  public show = asyncHanlder(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const course = await Course.findById(id).populate({ path: "bootcamp" });

      if (!course) {
        return next(
          new ErrorResponse(`No Course Found With The Id of ${id}`, 404)
        );
      }

      res.json({ success: true, data: course });
    }
  );

  public update = asyncHanlder(async (req: Request, res: Response) => {
    Object.assign(req.targetCourse, req.body);

    await req.targetCourse.save();
    res.json({ success: true, data: req.targetCourse });
  });

  public destroy = asyncHanlder(async (req: Request, res: Response) => {
    await req.targetCourse.remove();

    res.json({ success: true, data: {} });
  });
}

export const CourseController = new CourseControllerClass();

export default CourseController;
