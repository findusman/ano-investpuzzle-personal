import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { RequestHandler } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { HttpException, NotFoundException } from "_app/exceptions";

export function queryMiddleware<T>(type: any, skipMissingProperties = false): RequestHandler {
  return (req, res, next) => {
    validate(plainToClass(type, req.query), { skipMissingProperties }).then((errors: ValidationError[]) => {
      try {
        if (errors.length > 0) {
          const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(", ");
          next(new HttpException(400, message));
        } else {
          next();
        }
      } catch (error) {
        next(new HttpException(400, "Bad request"));
      }
    });
  };
}

export const queryIdValidator = (object: string): RequestHandler => {
  return (req, res, next) => {
    if (isValidObjectId(req.params.id)) {
      next();
    } else {
      next(new NotFoundException(object));
    }
  };
};

export const paramsValidator = (args: Array<{ name: string; validator?: any }>): RequestHandler => {
  return (req, res, next) => {
    const errors: HttpException[] = [];
    args.forEach(({ name, validator }) => {
      if (validator && !validator(req.params[name])) {
        errors.push(new HttpException(400, `Invalid ${name}`));
      }
    });
    if (errors.length > 0) {
      next(errors[0]);
    } else {
      next();
    }
  };
};
