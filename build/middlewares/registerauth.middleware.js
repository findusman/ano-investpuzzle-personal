"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const exceptions_1 = require("_app/exceptions");
function registerAuthMiddleware(params = undefined) {
    const { skipAuthorization } = params || {};
    return async (request, response, next) => {
        const header = request.headers["authorization"];
        const token = header && header.replace(/^Bearer\s+/, "");
        if (token) {
            try {
                const secret = process.env.JWT_SECRET;
                const verificationResponse = jwt.verify(token, secret);
                // check if it's register token
                if (verificationResponse.tokentype == 1) {
                    // if it's register token
                    const { code } = request.body;
                    request.email = verificationResponse.email;
                    request.username = verificationResponse.username;
                    request.code = verificationResponse.code;
                    request.token = token;
                    next();
                    return;
                }
                next(new exceptions_1.WrongAuthenticationTokenException("Something is wrong with your request"));
                return;
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
exports.default = registerAuthMiddleware;
//# sourceMappingURL=registerauth.middleware.js.map