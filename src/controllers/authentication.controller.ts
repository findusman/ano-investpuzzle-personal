import { Request, Response, NextFunction } from "express";
import { FirebaseScrypt } from "firebase-scrypt";

import { HttpException, NotFoundException, WrongCredentialsException } from "_app/exceptions";
import { Controller, RequestWithProfessorSignup, RequestWithSignup, RequestWithUser, User } from "_app/interfaces";
import { authMiddleware, registerAuthMiddleware, validationMiddleware } from "_app/middlewares";
import { AuthProvider } from "_app/enums";
import { UserNameEmailCheckDto, EmailCheckDto, CreateUserDto, LogInDto, ResetPasswordTokenDto, CreateProfessorDto, AccessCodeCheckDto } from "_app/dtos";
import { LoggerFactory } from "_app/factories";

import { Env } from "_app/config";

class AuthenticationController extends Controller {
  constructor(loggerFactory: LoggerFactory) {
    super("/auth", loggerFactory.getNamedLogger("auth-controller"));
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/confirmaccesscode`,
      validationMiddleware(AccessCodeCheckDto),
      this.confirmAccessCode
    );

    this.router.post(
      `${this.path}/authenticateUser`,
      validationMiddleware(UserNameEmailCheckDto),
      this.userNameEmailCheck
    );

    this.router.post(
      `${this.path}/registerUser`,
      validationMiddleware(CreateUserDto),
      registerAuthMiddleware({ skipAuthorization: false }),
      this.registration
    );

    this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.login);

    this.router.post(
      `${this.path}/registerProfessor`,
      validationMiddleware(CreateProfessorDto),
      registerAuthMiddleware({ skipAuthorization: true }),
      this.registerProfessor
    );

    this.router.post(
      `${this.path}/getUserDetail`,
      authMiddleware({ skipAuthorization: false }),
      this.getUserDetailByToken
    );

    this.router.post(
      `${this.path}/forgotPassowrdEmailCheck`,
      validationMiddleware(EmailCheckDto),
      this.forgotPassowrdEmailCheck
    );

    this.router.post(
      `${this.path}/resetPassword`,
      validationMiddleware(ResetPasswordTokenDto),
      registerAuthMiddleware({ skipAuthorization: false }),
      this.resetPassword
    );
  }

  private confirmAccessCode = async (request: Request, response: Response, next: NextFunction) => {
    const bodyData: AccessCodeCheckDto = request.body;
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
    } else {
      response.status(400).send({ message: "This access code is invalid" });
    }
  };

  private userNameEmailCheck = async (request: Request, response: Response, next: NextFunction) => {
    const bodyData: UserNameEmailCheckDto = request.body;
    const userByEmail = (await this._userService.getUserByEmail(bodyData.email)) as User;
    if (userByEmail) {
      response.status(400).send({ message: "Email exists!" });
    } else {
      //response.send({ exists: false });
      const userByName = (await this._userService.getUserByUsername(bodyData.username)) as User;
      if (userByName) {
        response.status(400).send({ message: "Username exists!" });
      } else {
        try {
          const { code, token } = await this._userService.sendEmailVerificationCode(bodyData.email, bodyData.username);
          response.status(200).send({
            message: "Email verification code has been sent to your email account",
            data: {
              jwt: token,
            },
            code: code,
          });
        } catch (error) {
          response.status(400).send({ message: error });
        }
      }
    }
  };

  private registration = async (request: RequestWithSignup, response: Response, next: NextFunction) => {
    const userData: CreateUserDto = request.body;
    try {
      const pronouns = await this._accessoriesService.getPronounsById(userData.pronounsId);
      const education = await this._accessoriesService.getEducationById(userData.educationId);
      const country = await this._accessoriesService.getCountryById(userData.countryId);
      if (pronouns && education && country) {
        const { user, token } = await this._authenticationService.register(
          userData,
          request.email,
          request.username,
          1000000,
          pronouns.id,
          education.id,
          country.id,
        );
        const professor = await this._userService.getUserById(userData.professor);
        await this._userService.sendNewStudentRegisterEmail(professor.email, professor.username, request.username, request.email);
        user.jwt = token;
        response.send({ message: "signup success", data: { user: user } });
      } else {
        next(new NotFoundException("Pronouns, Education or Country"));
      }
    } catch (error) {
      next(error);
    }
  };

  private login = async (request: Request, response: Response, next: NextFunction) => {
    const logInData: LogInDto = request.body;
    var user;
    if (logInData.loginType == "0") {
      user = await this._userService.getUserByEmail(logInData.emailOrUsername);
      if (!user) {
        user = await this._userService.getUserByUsername(logInData.emailOrUsername);
      }
    } else {
      user = await this._userService.getUserBySocialId(logInData.socialId);
    }

    if (user) {
      try {
        var isPasswordMatching = false;
        if (logInData.loginType == "0") {
          const hash_config = {
            signerKey: Env.FIREBASE_AUTH_SIGNER_KEY,
            saltSeparator: Env.FIREBASE_AUTH_SALT_SEPARTOR,
            rounds: 8,
            memCost: 14,
          };
          const scrypt = new FirebaseScrypt(hash_config);

          isPasswordMatching = await scrypt.verify(
            logInData.password,
            user.get("salt", null, { getters: false }) || Env.FIREBASE_AUTH_SALT_SEPARTOR,
            user.get("passwordHash", null, { getters: false })
          );
        } else {
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
              } catch (error) {
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
        } else {
          next(new WrongCredentialsException());
        }
      } catch (error) {
        next(new WrongCredentialsException());
      }
    } else {
      next(new NotFoundException("User"));
    }
  };

  private getUserDetailByToken = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    response.send({ user: request.user });
  };

  private forgotPassowrdEmailCheck = async (request: Request, response: Response, next: NextFunction) => {
    const logInData: EmailCheckDto = request.body;
    try {
      const { code, token } = await this._userService.getUserBgetUserByEmailForEmailSignedUseryEmail(
        logInData.email,
        "0"
      );
      response.status(200).send({
        message: "Email verification code has been sent to your email account",
        data: {
          jwt: token,
          code: code,
        },
      });
    } catch (error) {
      response.status(400).send({ message: "user not found" });
    }
  };

  private resetPassword = async (request: RequestWithSignup, response: Response, next: NextFunction) => {
    const { email, password }: ResetPasswordTokenDto = request.body;
    try {
      const user = (await this._userService.getUserByEmail(email)) as User;
      if (user) {
        await this._userService.resetPassword(email, password);
        const tokenData = this._authenticationService.createToken(user);
        user.jwt = tokenData.token;
        response.send({ message: "password changed successfully", data: { user: user } });
      } else {
        response.status(400).send({ message: "Wrong email" });
      }
    } catch (error) {
      response.status(400).send({ message: "Token Expired" });
    }
  };

  private loggingOut = (request: Request, response: Response) => {
    response.setHeader("Set-Cookie", ["Authorization=;Max-age=0"]);
    response.send(200);
  };

  //=================== Professor Side================
  private registerProfessor = async (request: RequestWithProfessorSignup, response: Response, next: NextFunction) => {
    const userData: CreateProfessorDto = request.body;
    try {
      const userByEmail = (await this._userService.getUserByEmail(userData.email)) as User;
      if (userByEmail) {
        response.status(400).send({ message: "Email exists!" });
      } else {
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
        } catch (error) {
          response.status(400).send({ message: error });
        }
      }

    } catch (error) {
      next(error);
    }
  };
}

export default AuthenticationController;
