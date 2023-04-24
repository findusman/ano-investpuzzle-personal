"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const jwt = require("jsonwebtoken");
const models_1 = require("_app/models");
const exceptions_1 = require("_app/exceptions");
function socketAuthMiddleware() {
    return async (socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        if (!token) {
            next(new exceptions_1.AuthenticationTokenMissingException());
        }
        else {
            try {
                const secret = process.env.JWT_SECRET;
                const verificationResponse = jwt.verify(token, secret);
                const user = await models_1.userModel.findOne({ _id: verificationResponse._id });
                socket.request.user = user;
                next();
            }
            catch (error) {
                next(new exceptions_1.WrongAuthenticationTokenException());
            }
        }
    };
}
exports.socketAuthMiddleware = socketAuthMiddleware;
//# sourceMappingURL=socket.auth.middleware.js.map