import { NextFunction, RequestHandler, Response } from "express";
import * as http from "http";
import * as jwt from "jsonwebtoken";

import { userModel } from "_app/models";
import { DataStoredInToken, RequestWithUser, User } from "_app/interfaces";
import { AuthenticationTokenMissingException, WrongAuthenticationTokenException } from "_app/exceptions";
import { Socket } from "socket.io";
import { SocketReservedEventsMap } from "socket.io/dist/socket";
import { ExtendedError } from "socket.io/dist/namespace";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

interface SocketRequest extends http.IncomingMessage {
  user: User;
}
export function socketAuthMiddleware() {
  return async (
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    next: (err?: ExtendedError) => void
  ) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    if (!token) {
      next(new AuthenticationTokenMissingException());
    } else {
      try {
        const secret = process.env.JWT_SECRET;
        const verificationResponse = jwt.verify(token, secret) as DataStoredInToken;
        const user = await userModel.findOne({ _id: verificationResponse._id });
        (socket.request as SocketRequest).user = user;
        next();
      } catch (error) {
        next(new WrongAuthenticationTokenException());
      }
    }
  };
}
