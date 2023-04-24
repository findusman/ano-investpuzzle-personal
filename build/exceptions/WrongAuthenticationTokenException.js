"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class WrongAuthenticationTokenException extends HttpException_1.default {
    constructor(message) {
        super(401, message || "Wrong authentication token");
    }
}
exports.default = WrongAuthenticationTokenException;
//# sourceMappingURL=WrongAuthenticationTokenException.js.map