import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { RequestHandler } from "express";

import { HttpException } from "_app/exceptions";

function validationMiddleware<T>(type: any, skipMissingProperties = false, whitelist = false): RequestHandler {
  return (req, res, next) => {
    validate(plainToClass(type, req.body), {
      skipMissingProperties,
      whitelist,
      forbidNonWhitelisted: true

    }).then((errors: ValidationError[]) => {
      try {
        if (errors.length > 0) {
          // const message = errors.map((error: ValidationError) => Object.values(error.constraints));
          const msg = Object.values(errors[0].constraints)[0];
          next(new HttpException(400, msg));
        } else {
          next();
        }
      } catch (error) {
        next(new HttpException(400, "Bad request"));
      }
    });
  };
}


export default validationMiddleware;

