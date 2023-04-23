import { NextFunction, Request, RequestHandler, ErrorRequestHandler, Response } from "express";
import * as Logger from "bunyan";

function loggerMiddleware<T>(logger: Logger): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    response.on("finish", () => {
      if (response.statusCode === 200) {
        logger.debug({
          url: request.url,
          method: request.method,
          request: request.body,
          header: request.headers,
          status: response.statusCode,
        });
      }
    });
    next();
  };
}

export default loggerMiddleware;
