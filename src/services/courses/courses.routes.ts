import { Router } from "express";

import CourseController from "./courses.controller";
import queryResults from "../../middlewares/query";
import Course from "./courses.model";
import AuthMiddleware from "../../middlewares/auth";
import { Role } from "../users/user.interface";

const courseRoutes = Router({ mergeParams: true });

courseRoutes
  .route("/")
  .get(
    queryResults(Course, { path: "bootcamp", select: "name description" }),
    CourseController.list
  )
  .post(
    AuthMiddleware.protect,
    AuthMiddleware.authorized(Role.PUBLISHER, Role.ADMIN),
    CourseController.create
  );

courseRoutes
  .route("/:id")
  .get(CourseController.show)
  .put(
    AuthMiddleware.protect,
    AuthMiddleware.authorized(Role.PUBLISHER, Role.ADMIN),
    CourseController.find,
    CourseController.update
  )
  .delete(
    AuthMiddleware.protect,
    AuthMiddleware.authorized(Role.PUBLISHER, Role.ADMIN),
    CourseController.find,
    CourseController.destroy
  );

export default courseRoutes;
