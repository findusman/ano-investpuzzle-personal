"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const jwt = require("jsonwebtoken");
const google_auth_library_1 = require("google-auth-library");
const apple_signin_auth_1 = require("apple-signin-auth");
const firebase_scrypt_1 = require("firebase-scrypt");
const moment = require("moment");
const mongoose_1 = require("mongoose");
const models_1 = require("_app/models");
const exceptions_1 = require("_app/exceptions");
const config_1 = require("_app/config");
const user_service_1 = require("./user.service");
const utils_1 = require("../utils");
const GoogleClient = new google_auth_library_1.OAuth2Client(config_1.GOOGLE_CONFIG.WEB_CLIENT_ID);
class AuthenticationService {
    constructor() {
        this.user = models_1.userModel;
        this.userService = user_service_1.UserService.getInstance();
        // public createRegisterToken(user: User): TokenData {
        //   const expiresIn = 60 * 60 * 24; // 1 day
        //   const secret = Env.JWT_SECRET;
        //   const dataStoredInToken: DataStoredInToken = {
        //     _id: user._id,
        //     isRegisterToken: true,
        //   };
        //   return {
        //     expiresIn,
        //     token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        //   };
        // }
    }
    static getInstance() {
        if (!AuthenticationService._sharedInstance) {
            AuthenticationService._sharedInstance = new AuthenticationService();
        }
        return AuthenticationService._sharedInstance;
    }
    async register(userData, email, username, availableFunds, pronounsId, educationId, countryId) {
        if (await this.user.findOne({ email: email })) {
            throw new exceptions_1.UserAlreadyExistsException(email, false);
        }
        if (await this.userService.getUserByUsername(username)) {
            throw new exceptions_1.AlreadyExistsException(`Username "${username}" already exists`);
        }
        const hash_config = {
            signerKey: config_1.Env.FIREBASE_AUTH_SIGNER_KEY,
            saltSeparator: config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR,
            rounds: 8,
            memCost: 14,
        };
        const scrypt = new firebase_scrypt_1.FirebaseScrypt(hash_config);
        const hashedPassword = await scrypt.hash(userData.password, config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR);
        delete userData.password;
        const user = await this.user.create({
            email: email,
            emailVerified: true,
            passwordHash: hashedPassword,
            username: username,
            pronoun: new mongoose_1.default.Types.ObjectId(pronounsId),
            yearOfBirth: userData.yearofBirth,
            education: new mongoose_1.default.Types.ObjectId(educationId),
            country: new mongoose_1.default.Types.ObjectId(countryId),
            socialId: userData.socialId,
            loginType: userData.loginType,
            availableFunds: availableFunds,
            initFunds: availableFunds,
            otherPronouns: userData.otherPronouns,
            otherEducation: userData.otherEducation,
            userType: 1,
            professor: userData.professor,
            isApprovedByProfessor: false,
            createdAt: moment().unix() * 1000,
            userFullName: `Beginner goat ${(0, utils_1.generateRandomInt)(100, 1000)}`,
        });
        const tokenData = this.createToken(user);
        const cookie = this.createCookie(tokenData);
        const newUser = await this.user.findOne({ email: email });
        return {
            cookie,
            token: tokenData.token,
            user: newUser,
        };
    }
    async registerProfessor(userData) {
        if (await this.user.findOne({ email: userData.email })) {
            throw new exceptions_1.UserAlreadyExistsException(userData.email, false);
        }
        if (await this.userService.getUserByUsername(userData.username)) {
            throw new exceptions_1.AlreadyExistsException(`Username "${userData.username}" already exists`);
        }
        const hash_config = {
            signerKey: config_1.Env.FIREBASE_AUTH_SIGNER_KEY,
            saltSeparator: config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR,
            rounds: 8,
            memCost: 14,
        };
        const scrypt = new firebase_scrypt_1.FirebaseScrypt(hash_config);
        const hashedPassword = await scrypt.hash(userData.password, config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR);
        delete userData.password;
        const user = await this.user.create({
            email: userData.email,
            emailVerified: false,
            passwordHash: hashedPassword,
            username: userData.username,
            availableFunds: userData.fundsAum,
            initFunds: userData.fundsAum,
            createdAt: moment().unix() * 1000,
            userFullName: userData.userFullName,
            userPhone: userData.userPhone,
            universityName: userData.universityName,
            title: userData.title,
            userType: 0,
            fundName: userData.fundName
        });
        const tokenData = this.createToken(user);
        const cookie = this.createCookie(tokenData);
        const newUser = await this.user.findOne({ email: userData.email });
        return {
            cookie,
            token: tokenData.token,
            user: newUser,
        };
    }
    async checkUserAvailable(user) {
        if (user.userType != undefined && user.userType === 0) { // it's professor
            if (user.emailVerified != true) {
                return 1; // email not verified
            }
            else {
                if (user.endOfSubscriptionDate == undefined || user.endOfSubscriptionDate === null) {
                    return 2; // payment source did not verified
                }
                else {
                    if (user.endOfSubscriptionDate < new Date()) { // if subscription date is passed
                        return 3; // subscription expired
                    }
                    else {
                        const totalUsers = await this.userService.getAllUsersOfProfessor(user._id.toString(), 0);
                        if (user.totalSubscribedNumberOfStudents != undefined && user.totalSubscribedNumberOfStudents != null && totalUsers.length >= user.totalSubscribedNumberOfStudents) {
                            return 7; // user limited : can't register more users
                        }
                        else {
                            return 0;
                        }
                    }
                }
            }
        }
        else { // it's student
            const professor = await this.user.findById(user.professor);
            if (professor) {
                if (professor.endOfSubscriptionDate === undefined || professor.endOfSubscriptionDate === null) {
                    return 5; // professor's payment source did not verified
                }
                else {
                    if (professor.endOfSubscriptionDate < new Date()) { // if subscription date is passed
                        return 6; // professor's subscription expired
                    }
                    else {
                        if (user.isApprovedByProfessor === undefined || user.isApprovedByProfessor === null || user.isApprovedByProfessor === false) {
                            return 8;
                        }
                        else {
                            return 0;
                        }
                    }
                }
            }
            else {
                return 4; // this student hasn't professor
            }
        }
    }
    async registerGoogleUser(googleUser) {
        if (await this.user.findOne({ email: googleUser.email })) {
            throw new exceptions_1.UserAlreadyExistsException(googleUser.email, false);
        }
        const user = await this.user.create({
            email: googleUser.email,
            firstName: googleUser.given_name,
            lastName: googleUser.family_name,
            photoUrl: googleUser.picture,
            emailVerified: true,
            createdAt: moment().unix() * 1000,
            username: `google_${Date.now()}}`,
            providers: [
                {
                    providerId: "google.com",
                    rawId: googleUser.sub,
                    email: googleUser.email,
                    displayName: googleUser.name,
                    photoUrl: googleUser.picture,
                },
            ],
        });
        // const tokenData = this.createRegisterToken(user);
        // const newUser = await this.user.findOne({ email: googleUser.email });
        // return {
        //   registerToken: tokenData.token,
        //   user: newUser,
        // };
    }
    async registerAppleUser(appleUser) {
        if (await this.user.findOne({ email: appleUser.email })) {
            throw new exceptions_1.UserAlreadyExistsException(appleUser.email, false);
        }
        const user = await this.user.create({
            email: appleUser.email,
            emailVerified: appleUser.email_verified,
            createdAt: moment().unix() * 1000,
            username: `apple_${Date.now()}}`,
            providers: [
                {
                    providerId: "apple.com",
                    rawId: appleUser.sub,
                    email: appleUser.email,
                },
            ],
        });
        // const tokenData = this.createRegisterToken(user);
        // const newUser = await this.user.findOne({ email: appleUser.email });
        // return {
        //   registerToken: tokenData.token,
        //   user: newUser,
        // };
    }
    async googleAuth(token) {
        return await GoogleClient.verifyIdToken({ idToken: token });
    }
    async appleAuth(token) {
        return await apple_signin_auth_1.default.verifyIdToken(token);
    }
    createCookie(tokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }
    createToken(user, isAdmin = false) {
        const expiresIn = 60 * 60 * 24 * 30 * 6; // 6 month
        const secret = config_1.Env.JWT_SECRET;
        const dataStoredInToken = {
            _id: user._id,
            tokentype: 1,
            isAdmin,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        };
    }
}
exports.AuthenticationService = AuthenticationService;
AuthenticationService._sharedInstance = null;
//# sourceMappingURL=authentication.service.js.map