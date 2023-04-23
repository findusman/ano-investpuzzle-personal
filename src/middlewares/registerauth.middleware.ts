import { NextFunction, RequestHandler, Response } from "express";
import * as jwt from "jsonwebtoken";

import { verificationModel } from "_app/models";
import { DataStoredInToken, RequestWithSignup } from "_app/interfaces";
import { EmailVerifyTokenDto } from "_app/dtos";
import { AuthenticationTokenMissingException, HttpException, WrongAuthenticationTokenException } from "_app/exceptions";

interface AuthMiddlewareParams {
  skipAuthorization?: boolean;
}

function registerAuthMiddleware<T>(params: AuthMiddlewareParams = undefined): RequestHandler {
  const { skipAuthorization } = params || {};

  return async (request: RequestWithSignup, response: Response, next: NextFunction) => {
    const header = request.headers["authorization"];
    const token = header && header.replace(/^Bearer\s+/, "");
    if (token) {
      try {
        const secret = process.env.JWT_SECRET;
        const verificationResponse = jwt.verify(token, secret) as DataStoredInToken;

        // check if it's register token
        if (verificationResponse.tokentype == 1) {
          // if it's register token
          const { code }: EmailVerifyTokenDto = request.body;

          request.email = verificationResponse.email;
          request.username = verificationResponse.username;
          request.code = verificationResponse.code;
          request.token = token;
          next();
          return;
        }
        next(new WrongAuthenticationTokenException("Something is wrong with your request"));
        return;
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

export default registerAuthMiddleware;
