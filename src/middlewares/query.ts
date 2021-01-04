import { Request, Response, NextFunction } from "express";

interface IPopulate {
  path: string;
  select: string;
}

const queryResults = (model: any, populate?: String | IPopulate ) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let query: any;

  const requestQuery = { ...req.query };

  const removeFields = ["sort", "select", "limit", "page"];

  removeFields.forEach((param) => delete requestQuery[param]);

  let queryString = JSON.stringify(requestQuery);

  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  query = model.find(JSON.parse(queryString));

  if (req.query.select) {
    const fields = (<string>req.query.select).split(",").join(" ");
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sort = (<string>req.query.sort).split(",").join(" ");
    query = query.sort(sort);
  } else {
    query = query.sort("-createdAt");
  }

  const page = parseInt(<string>req.query.page, 10) || 1;
  const limit = parseInt(<string>req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  const results = await query;
  const pagination = {
    prev: {},
    next: {},
    totalPages: Math.ceil(total / limit),
  };

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  (<any>res).queryResults = {
    success: true,
    pagination,
    count: results.length,
    data: results,
  };

  next();
};

export default queryResults;
