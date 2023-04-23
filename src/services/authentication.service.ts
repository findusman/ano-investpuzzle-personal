import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import appleSignin, { AppleIdTokenType } from "apple-signin-auth";
import { FirebaseScrypt } from "firebase-scrypt";
import moment = require("moment");
import mongoose from "mongoose";

import { userModel } from "_app/models";
import { CreateProfessorDto, CreateUserDto } from "_app/dtos";
import { AlreadyExistsException, UserAlreadyExistsException } from "_app/exceptions";
import { User, DataStoredInToken, TokenData } from "_app/interfaces";
import { Env, GOOGLE_CONFIG } from "_app/config";
import { UserService } from "./user.service";
import { generateRandomInt } from "../utils";

const GoogleClient = new OAuth2Client(GOOGLE_CONFIG.WEB_CLIENT_ID);

export class AuthenticationService {
  public user = userModel;
  private userService = UserService.getInstance();

  static _sharedInstance: AuthenticationService = null;

  static getInstance() {
    if (!AuthenticationService._sharedInstance) {
      AuthenticationService._sharedInstance = new AuthenticationService();
    }
    return AuthenticationService._sharedInstance;
  }

  public async register(
    userData: CreateUserDto,
    email: string,
    username: string,
    availableFunds: number,
    pronounsId: string,
    educationId: string,
    countryId: string,

  ) {
    if (await this.user.findOne({ email: email })) {
      throw new UserAlreadyExistsException(email, false);
    }
    if (await this.userService.getUserByUsername(username)) {
      throw new AlreadyExistsException(`Username "${username}" already exists`);
    }
    const hash_config = {
      signerKey: Env.FIREBASE_AUTH_SIGNER_KEY,
      saltSeparator: Env.FIREBASE_AUTH_SALT_SEPARTOR,
      rounds: 8,
      memCost: 14,
    };
    const scrypt = new FirebaseScrypt(hash_config);
    const hashedPassword = await scrypt.hash(userData.password, Env.FIREBASE_AUTH_SALT_SEPARTOR);
    delete userData.password;

    const user = await this.user.create({
      email: email,
      emailVerified: true,
      passwordHash: hashedPassword,
      username: username,
      pronoun: new mongoose.Types.ObjectId(pronounsId),
      yearOfBirth: userData.yearofBirth,
      education: new mongoose.Types.ObjectId(educationId),
      country: new mongoose.Types.ObjectId(countryId),
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
      userFullName: `Beginner goat ${generateRandomInt(100, 1000)}`,
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

  public async registerProfessor(userData: CreateProfessorDto) {
    if (await this.user.findOne({ email: userData.email })) {
      throw new UserAlreadyExistsException(userData.email, false);
    }
    if (await this.userService.getUserByUsername(userData.username)) {
      throw new AlreadyExistsException(`Username "${userData.username}" already exists`);
    }
    const hash_config = {
      signerKey: Env.FIREBASE_AUTH_SIGNER_KEY,
      saltSeparator: Env.FIREBASE_AUTH_SALT_SEPARTOR,
      rounds: 8,
      memCost: 14,
    };
    const scrypt = new FirebaseScrypt(hash_config);
    const hashedPassword = await scrypt.hash(userData.password, Env.FIREBASE_AUTH_SALT_SEPARTOR);
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

  public async checkUserAvailable(user: User) {
    if (user.userType != undefined && user.userType === 0) {// it's professor
      if (user.emailVerified != true) {
        return 1; // email not verified
      } else {
        if (user.endOfSubscriptionDate == undefined || user.endOfSubscriptionDate === null) {
          return 2; // payment source did not verified
        } else {
          if (user.endOfSubscriptionDate < new Date()) { // if subscription date is passed
            return 3; // subscription expired
          } else {
            const totalUsers = await this.userService.getAllUsersOfProfessor(user._id.toString(), 0);
            if (user.totalSubscribedNumberOfStudents != undefined && user.totalSubscribedNumberOfStudents != null && totalUsers.length >= user.totalSubscribedNumberOfStudents) {
              return 7; // user limited : can't register more users
            } else {
              return 0;
            }
          }
        }
      }
    } else { // it's student
      const professor = await this.user.findById(user.professor);
      if (professor) {
        if (professor.endOfSubscriptionDate === undefined || professor.endOfSubscriptionDate === null) {
          return 5; // professor's payment source did not verified
        } else {
          if (professor.endOfSubscriptionDate < new Date()) { // if subscription date is passed
            return 6; // professor's subscription expired
          } else {
            if (user.isApprovedByProfessor === undefined || user.isApprovedByProfessor === null || user.isApprovedByProfessor === false) {
              return 8;
            } else {
              return 0;
            }
          }
        }
      } else {
        return 4; // this student hasn't professor
      }
    }
  }


  public async registerGoogleUser(googleUser: TokenPayload) {
    if (await this.user.findOne({ email: googleUser.email })) {
      throw new UserAlreadyExistsException(googleUser.email, false);
    }

    const user = await this.user.create({
      email: googleUser.email,
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      photoUrl: googleUser.picture,
      emailVerified: true,
      createdAt: moment().unix() * 1000,
      username: `google_${Date.now()}}`, // assign temp unique username due to database index
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

  public async registerAppleUser(appleUser: AppleIdTokenType) {
    if (await this.user.findOne({ email: appleUser.email })) {
      throw new UserAlreadyExistsException(appleUser.email, false);
    }

    const user = await this.user.create({
      email: appleUser.email,
      emailVerified: appleUser.email_verified,
      createdAt: moment().unix() * 1000,
      username: `apple_${Date.now()}}`, // assign temp unique username due to database index
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

  public async googleAuth(token: string) {
    return await GoogleClient.verifyIdToken({ idToken: token });
  }

  public async appleAuth(token: string) {
    return await appleSignin.verifyIdToken(token);
  }

  public createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  public createToken(user: User, isAdmin: boolean = false): TokenData {
    const expiresIn = 60 * 60 * 24 * 30 * 6; // 6 month
    const secret = Env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id,
      tokentype: 1,
      isAdmin,
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

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
