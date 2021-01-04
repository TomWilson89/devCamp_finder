import { Router } from "express";

import BootcampController from "./bootcamp.controller";
import queryResults from "../../middlewares/query";
import Bootcamp from "./bootcamp.model";
import courseRoutes from "../courses/courses.routes";
import AuthMiddleware from "../../middlewares/auth";
import { Role } from "../users/user.interface";
import reviewRoutes from "../reviews/review.routes";

const bootcampRoutes = Router();

bootcampRoutes.use("/:bootcampId/courses", courseRoutes);
bootcampRoutes.use("/:bootcampId/reviews", reviewRoutes);

bootcampRoutes
  .route("/")
  .get(queryResults(Bootcamp, "courses"), BootcampController.list)
  .post(
    AuthMiddleware.protect,
    AuthMiddleware.authorized(Role.PUBLISHER, Role.ADMIN),
    BootcampController.create
  );

bootcampRoutes
  .route("/:id")
  .get(BootcampController.show)
  .put(
    AuthMiddleware.protect,
    AuthMiddleware.authorized(Role.PUBLISHER, Role.ADMIN),
    BootcampController.find,
    BootcampController.update
  )
  .delete(
    AuthMiddleware.protect,
    AuthMiddleware.authorized(Role.PUBLISHER, Role.ADMIN),
    BootcampController.find,
    BootcampController.destroy
  );

bootcampRoutes
  .route("/radius/:zipcode/:distance")
  .get(BootcampController.listByRadius);

bootcampRoutes.route("/:id/photo").put(BootcampController.fileUpload);

export default bootcampRoutes;
