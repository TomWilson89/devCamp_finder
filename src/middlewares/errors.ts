import { Request, Response, NextFunction } from "express";

import ErrorResponse from "../utils/ErrorResponse";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };

  error.message = err.message;

  console.log(err.stack.red);

  if (err.name === "CastError") {
    const message = `Resource not found with the id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }
  if (err.code === 11000) {
    const message = `Duplicated value entered`;
    error = new ErrorResponse(message, 400);
  }
  if (err.name === "ValidationError") {
    const message: any = Object.values(err.errors).map(
      (value: any) => value.message
    );
    error = new ErrorResponse(message, 400);
  }

  console.log(error.message);
  return res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || "Server Error" });
};

export default errorHandler;
