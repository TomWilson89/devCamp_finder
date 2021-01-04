import path from "path";

import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import fileupload from "express-fileupload";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";
import "colorts/lib/string";

import connectDb from "./config/db";
import bootcampRoutes from "./src/services/bootcamp/bootcamp.routes";
import errorHandler from "./src/middlewares/errors";
import courseRoutes from "./src/services/courses/courses.routes";
import authRoutes from "./src/services/auth/auth.routes";
import userRoutes from "./src/services/users/user.routes";
import reviewRoutes from "./src/services/reviews/review.routes";

dotenv.config({ path: "./config/config.env" });

const app = express();
connectDb();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(fileupload());
app.use(cookieParser());
app.use(hpp());
app.use(cors());
app.use(mongoSanitize());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;

//Bootcamp Routes
app.use("/api/v1/bootcamps", bootcampRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);

app.use(errorHandler);

const server = app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.green.bold
  )
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Unhandled Rejection: ${err}`);
  server.close(() => process.exit(1));
});
