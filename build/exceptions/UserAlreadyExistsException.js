"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class UserAlreadyExistsException extends HttpException_1.default {
    constructor(email, isAdmin = false) {
        super(409, `User with email ${email} already exists`);
    }
}
exports.default = UserAlreadyExistsException;
//# sourceMappingURL=UserAlreadyExistsException.js.map