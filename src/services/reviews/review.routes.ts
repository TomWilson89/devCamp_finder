import { Router } from "express";

import Review from "./review.model";
import ReviewController from "./review.controllers";
import { Role } from "../users/user.interface";

import queryResults from "../../middlewares/query";
import AuthMiddleware from "../../middlewares/auth";

const reviewRoutes = Router({ mergeParams: true });

reviewRoutes
  .route("/")
  .get(
    AuthMiddleware.protect,
    queryResults(Review, { path: "bootcamp", select: "name description" }),
    ReviewController.list
  )
  .post(
    AuthMiddleware.protect,
    AuthMiddleware.authorized(Role.USER, Role.ADMIN),
    ReviewController.create
  );

reviewRoutes
  .route("/:id")
  .get(AuthMiddleware.protect, ReviewController.show)
  .put(
    AuthMiddleware.protect,
    AuthMiddleware.authorized(Role.ADMIN, Role.USER),
    ReviewController.find,
    ReviewController.update
  )
  .delete(
    AuthMiddleware.protect,
    AuthMiddleware.authorized(Role.ADMIN, Role.USER),
    ReviewController.find,
    ReviewController.destroy
  );

export default reviewRoutes;
