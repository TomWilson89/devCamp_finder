import { Router } from "express";

import UserController from "./user.controller";
import AuthMiddleware from "../../middlewares/auth";
import { Role } from "./user.interface";
import queryResults from "../../middlewares/query";
import User from "./user.model";

const userRoutes = Router();

userRoutes.use(AuthMiddleware.protect);
userRoutes.use(AuthMiddleware.authorized(Role.ADMIN));

userRoutes
  .route("/")
  .get(queryResults(User), UserController.list)
  .post(UserController.create);

userRoutes
  .route("/:id")
  .get(UserController.show)
  .put(UserController.update)
  .delete(UserController.destroy);

export default userRoutes;
