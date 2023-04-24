"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVerificationTokenParams = exports.parseVerificationToken = exports.createSignupToken = exports.generateVerifyCode = exports.userNameRegex = void 0;
const jwt = require("jsonwebtoken");
const config_1 = require("_app/config");
exports.userNameRegex = /^(?=.{3,32}$)(?:[a-zA-Z\d]+(?:(?:\.|-|_)[a-zA-Z\d])*)+$/;
const generateVerifyCode = (length) => {
    var code = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return { code };
};
exports.generateVerifyCode = generateVerifyCode;
const createSignupToken = (email, username, isRegisterToken, code, tokentype) => {
    const token = jwt.sign({ email, username, isRegisterToken, code, tokentype }, config_1.Env.JWT_SECRET, { expiresIn: "24h" });
    return { token };
};
exports.createSignupToken = createSignupToken;
const parseVerificationToken = (token) => {
    return jwt.verify(token, config_1.Env.JWT_SECRET);
};
exports.parseVerificationToken = parseVerificationToken;
const parseVerificationTokenParams = (token) => {
    return jwt.decode(token, { json: true });
};
exports.parseVerificationTokenParams = parseVerificationTokenParams;
//# sourceMappingURL=verification.js.map