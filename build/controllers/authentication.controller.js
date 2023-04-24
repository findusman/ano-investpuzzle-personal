"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_scrypt_1 = require("firebase-scrypt");
const exceptions_1 = require("_app/exceptions");
const interfaces_1 = require("_app/interfaces");
const middlewares_1 = require("_app/middlewares");
const dtos_1 = require("_app/dtos");
const config_1 = require("_app/config");
class AuthenticationController extends interfaces_1.Controller {
    constructor(loggerFactory) {
        super("/auth", loggerFactory.getNamedLogger("auth-controller"));
        this.confirmAccessCode = async (request, response, next) => {
            const bodyData = request.body;
            const professorData = await this._userService.getProfessorByAccessCode(bodyData.accesscode);
            if (professorData) {
                const isAvailable = await this._authenticationService.checkUserAvailable(professorData);
                switch (isAvailable) {
                    case 0:
                        response.status(200).send({
                            message: "success",
                            professor: professorData._id,
                        });
                        break;
                    case 1:
                        response.status(400).send({ message: "This Professor account has some problem", status: isAvailable });
                        break;
                    case 2:
                        response.status(400).send({ message: "This Professor account has some problem", status: isAvailable });
                        break;
                    case 3:
                        response.status(400).send({ message: "This Professor account has some problem", status: isAvailable });
                        break;
                    case 7:
                        response.status(400).send({ message: "This Professor account has some problem", status: isAvailable });
                        break;
                }
            }
            else {
                response.status(400).send({ message: "This access code is invalid" });
            }
        };
        this.userNameEmailCheck = async (request, response, next) => {
            const bodyData = request.body;
            const userByEmail = (await this._userService.getUserByEmail(bodyData.email));
            if (userByEmail) {
                response.status(400).send({ message: "Email exists!" });
            }
            else {
                //response.send({ exists: false });
                const userByName = (await this._userService.getUserByUsername(bodyData.username));
                if (userByName) {
                    response.status(400).send({ message: "Username exists!" });
                }
                else {
                    try {
                        const { code, token } = await this._userService.sendEmailVerificationCode(bodyData.email, bodyData.username);
                        response.status(200).send({
                            message: "Email verification code has been sent to your email account",
                            data: {
                                jwt: token,
                            },
                            code: code,
                        });
                    }
                    catch (error) {
                        response.status(400).send({ message: error });
                    }
                }
            }
        };
        this.registration = async (request, response, next) => {
            const userData = request.body;
            try {
                const pronouns = await this._accessoriesService.getPronounsById(userData.pronounsId);
                const education = await this._accessoriesService.getEducationById(userData.educationId);
                const country = await this._accessoriesService.getCountryById(userData.countryId);
                if (pronouns && education && country) {
                    const { user, token } = await this._authenticationService.register(userData, request.email, request.username, 1000000, pronouns.id, education.id, country.id);
                    const professor = await this._userService.getUserById(userData.professor);
                    await this._userService.sendNewStudentRegisterEmail(professor.email, professor.username, request.username, request.email);
                    user.jwt = token;
                    response.send({ message: "signup success", data: { user: user } });
                }
                else {
                    next(new exceptions_1.NotFoundException("Pronouns, Education or Country"));
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (request, response, next) => {
            const logInData = request.body;
            var user;
            if (logInData.loginType == "0") {
                user = await this._userService.getUserByEmail(logInData.emailOrUsername);
                if (!user) {
                    user = await this._userService.getUserByUsername(logInData.emailOrUsername);
                }
            }
            else {
                user = await this._userService.getUserBySocialId(logInData.socialId);
            }
            if (user) {
                try {
                    var isPasswordMatching = false;
                    if (logInData.loginType == "0") {
                        const hash_config = {
                            signerKey: config_1.Env.FIREBASE_AUTH_SIGNER_KEY,
                            saltSeparator: config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR,
                            rounds: 8,
                            memCost: 14,
                        };
                        const scrypt = new firebase_scrypt_1.FirebaseScrypt(hash_config);
                        isPasswordMatching = await scrypt.verify(logInData.password, user.get("salt", null, { getters: false }) || config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR, user.get("passwordHash", null, { getters: false }));
                    }
                    else {
                        isPasswordMatching = true;
                    }
                    if (isPasswordMatching) {
                        const isAvailable = await this._authenticationService.checkUserAvailable(user); //0: available, 1: email not verified for professor, 2: payment not verified for professor, 3:payment cycle ended for professor
                        const tokenData = this._authenticationService.createToken(user);
                        user.jwt = tokenData.token;
                        switch (isAvailable) {
                            case 0: // approve login     
                                response.send({ data: { user: user, redirect: isAvailable } });
                                break;
                            case 1: // professor => email not verified
                                try {
                                    const { code, token } = await this._userService.sendEmailVerificationCode(user.email, user.username);
                                    response.status(200).send({
                                        message: "Email verification code has been sent to your email account",
                                        redirect: isAvailable,
                                        data: {
                                            jwt: token,
                                        },
                                        //code: code,
                                    });
                                }
                                catch (error) {
                                    response.status(400).send({ message: error });
                                }
                                break;
                            case 2: // professor => payment source not verified
                                response.status(200).send({ message: "Please verify Payment source", user: user, redirect: isAvailable });
                                break;
                            case 3: // professor => subscription expired
                                response.status(200).send({ message: "Subscription has been expired", user: user, redirect: isAvailable });
                                break;
                            case 4: // student => hasn't professor
                                response.status(400).send({ message: "Your professor has been removed", redirect: isAvailable });
                                break;
                            case 5: // student => professor's payment source did not verified
                                response.status(400).send({ message: "Your professor account has some problem. please contact your professor", redirect: isAvailable });
                                break;
                            case 6: // student => professor's subscription expired
                                response.status(400).send({ message: "Your professor account has some problem. please contact your professor", redirect: isAvailable });
                                break;
                            case 8: // student => professor's subscription expired
                                response.status(400).send({ message: "Your are not approved by professor yet", redirect: isAvailable });
                                break;
                        }
                    }
                    else {
                        next(new exceptions_1.WrongCredentialsException());
                    }
                }
                catch (error) {
                    next(new exceptions_1.WrongCredentialsException());
                }
            }
            else {
                next(new exceptions_1.NotFoundException("User"));
            }
        };
        this.getUserDetailByToken = async (request, response, next) => {
            response.send({ user: request.user });
        };
        this.forgotPassowrdEmailCheck = async (request, response, next) => {
            const logInData = request.body;
            try {
                const { code, token } = await this._userService.getUserBgetUserByEmailForEmailSignedUseryEmail(logInData.email, "0");
                response.status(200).send({
                    message: "Email verification code has been sent to your email account",
                    data: {
                        jwt: token,
                        code: code,
                    },
                });
            }
            catch (error) {
                response.status(400).send({ message: "user not found" });
            }
        };
        this.resetPassword = async (request, response, next) => {
            const { email, password } = request.body;
            try {
                const user = (await this._userService.getUserByEmail(email));
                if (user) {
                    await this._userService.resetPassword(email, password);
                    const tokenData = this._authenticationService.createToken(user);
                    user.jwt = tokenData.token;
                    response.send({ message: "password changed successfully", data: { user: user } });
                }
                else {
                    response.status(400).send({ message: "Wrong email" });
                }
            }
            catch (error) {
                response.status(400).send({ message: "Token Expired" });
            }
        };
        this.loggingOut = (request, response) => {
            response.setHeader("Set-Cookie", ["Authorization=;Max-age=0"]);
            response.send(200);
        };
        //=================== Professor Side================
        this.registerProfessor = async (request, response, next) => {
            const userData = request.body;
            try {
                const userByEmail = (await this._userService.getUserByEmail(userData.email));
                if (userByEmail) {
                    response.status(400).send({ message: "Email exists!" });
                }
                else {
                    const { user, token } = await this._authenticationService.registerProfessor(userData);
                    try {
                        const { code, token } = await this._userService.sendEmailVerificationCode(user.email, user.username);
                        response.status(200).send({
                            message: "Email verification code has been sent to your email account",
                            redirect: 1,
                            data: {
                                jwt: token,
                            },
                            code: code,
                        });
                    }
                    catch (error) {
                        response.status(400).send({ message: error });
                    }
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/confirmaccesscode`, (0, middlewares_1.validationMiddleware)(dtos_1.AccessCodeCheckDto), this.confirmAccessCode);
        this.router.post(`${this.path}/authenticateUser`, (0, middlewares_1.validationMiddleware)(dtos_1.UserNameEmailCheckDto), this.userNameEmailCheck);
        this.router.post(`${this.path}/registerUser`, (0, middlewares_1.validationMiddleware)(dtos_1.CreateUserDto), (0, middlewares_1.registerAuthMiddleware)({ skipAuthorization: false }), this.registration);
        this.router.post(`${this.path}/login`, (0, middlewares_1.validationMiddleware)(dtos_1.LogInDto), this.login);
        this.router.post(`${this.path}/registerProfessor`, (0, middlewares_1.validationMiddleware)(dtos_1.CreateProfessorDto), (0, middlewares_1.registerAuthMiddleware)({ skipAuthorization: true }), this.registerProfessor);
        this.router.post(`${this.path}/getUserDetail`, (0, middlewares_1.authMiddleware)({ skipAuthorization: false }), this.getUserDetailByToken);
        this.router.post(`${this.path}/forgotPassowrdEmailCheck`, (0, middlewares_1.validationMiddleware)(dtos_1.EmailCheckDto), this.forgotPassowrdEmailCheck);
        this.router.post(`${this.path}/resetPassword`, (0, middlewares_1.validationMiddleware)(dtos_1.ResetPasswordTokenDto), (0, middlewares_1.registerAuthMiddleware)({ skipAuthorization: false }), this.resetPassword);
    }
}
exports.default = AuthenticationController;
//# sourceMappingURL=authentication.controller.js.map