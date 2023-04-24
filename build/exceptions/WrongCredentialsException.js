"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class WrongCredentialsException extends HttpException_1.default {
    constructor() {
        super(401, "Wrong credentials provided");
    }
}
exports.default = WrongCredentialsException;
//# sourceMappingURL=WrongCredentialsException.js.map