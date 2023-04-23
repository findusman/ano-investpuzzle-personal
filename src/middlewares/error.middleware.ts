import { NextFunction, Request, Response, ErrorRequestHandler } from "express";
import * as Logger from "bunyan";

import { HttpException } from "_app/exceptions";

function errorMiddleware(logger?: Logger): ErrorRequestHandler {
  return (error: HttpException, request: Request, response: Response, next: NextFunction) => {
    if (logger) {
      logger.error({
        url: request.url,
        method: request.method,
        request: request.body,
        header: request.headers,
        status: error.status,
        error: {
          stack: error.stack,
          message: error.message,
          status: error.status,
          name: error.name,
        },
      });
    }
    const status = error.status || 500;
    const message = error.message || "Something went wrong";
    response.status(status).send({
      message,
      status,
    });
  };
}

export default errorMiddleware;
