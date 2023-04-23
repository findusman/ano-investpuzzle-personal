import { NextFunction, RequestHandler, Response } from "express";
import * as jwt from "jsonwebtoken";

import { userModel, verificationModel } from "_app/models";
import { DataStoredInToken, RequestWithUser } from "_app/interfaces";
import { AuthenticationTokenMissingException, HttpException, WrongAuthenticationTokenException } from "_app/exceptions";

interface AuthMiddlewareParams {
  skipAuthorization?: boolean;
}

function authMiddleware<T>(params: AuthMiddlewareParams = undefined): RequestHandler {

  const { skipAuthorization } = params || {};

  return async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const header = request.headers["authorization"];
    const token = header && header.replace(/^Bearer\s+/, "");
    if (token) {
      try {
        const secret = process.env.JWT_SECRET;
        const verificationResponse = jwt.verify(token, secret) as DataStoredInToken;
        const user = await userModel.findById(verificationResponse._id);
        if (user) {
          request.user = user;
          next();
        } else {
          if (skipAuthorization) {
            next();
            return;
          }
          next(new WrongAuthenticationTokenException());
        }
      } catch (error) {
        if (skipAuthorization) {
          next();
          return;
        }
        next(new WrongAuthenticationTokenException());
      }
    } else {
      if (skipAuthorization) {
        next();
        return;
      }
      next(new AuthenticationTokenMissingException());
    }
  };
}

export default authMiddleware;
