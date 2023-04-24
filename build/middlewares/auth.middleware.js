"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const models_1 = require("_app/models");
const exceptions_1 = require("_app/exceptions");
function authMiddleware(params = undefined) {
    const { skipAuthorization } = params || {};
    return async (request, response, next) => {
        const header = request.headers["authorization"];
        const token = header && header.replace(/^Bearer\s+/, "");
        if (token) {
            try {
                const secret = process.env.JWT_SECRET;
                const verificationResponse = jwt.verify(token, secret);
                const user = await models_1.userModel.findById(verificationResponse._id);
                if (user) {
                    request.user = user;
                    next();
                }
                else {
                    if (skipAuthorization) {
                        next();
                        return;
                    }
                    next(new exceptions_1.WrongAuthenticationTokenException());
                }
            }
            catch (error) {
                if (skipAuthorization) {
                    next();
                    return;
                }
                next(new exceptions_1.WrongAuthenticationTokenException());
            }
        }
        else {
            if (skipAuthorization) {
                next();
                return;
            }
            next(new exceptions_1.AuthenticationTokenMissingException());
        }
    };
}
exports.default = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map