import { Router } from "express";

import AuthController from "./auth.controller";
import AuthMiddleware from "../../middlewares/auth";

const authRoutes = Router();

authRoutes.route("/register").post(AuthController.register);

authRoutes.route("/login").post(AuthController.login);

authRoutes.route("/me").get(AuthMiddleware.protect, AuthController.me);

authRoutes.route("/forgotpassword").post(AuthController.forgotPassword);
authRoutes
  .route("/updatedetails")
  .put(AuthMiddleware.protect, AuthController.update);

authRoutes
  .route("/resetpassword/:resetToken")
  .put(AuthController.resetPassword);

export default authRoutes;
