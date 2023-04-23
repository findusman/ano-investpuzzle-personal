import * as jwt from "jsonwebtoken";
import { Env } from "_app/config";

export const userNameRegex = /^(?=.{3,32}$)(?:[a-zA-Z\d]+(?:(?:\.|-|_)[a-zA-Z\d])*)+$/;

export const generateVerifyCode = (length: number) => {
  var code = '';
  var characters = '0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return {code};
}

export const createSignupToken = (email: string, username: string, isRegisterToken: boolean, code : string, tokentype : number) => {
  const token = jwt.sign({ email, username, isRegisterToken, code, tokentype }, Env.JWT_SECRET, { expiresIn: "24h" });
  return {  token };
}

export const parseVerificationToken = (token: string) => {
  return jwt.verify(token, Env.JWT_SECRET);
};

export const parseVerificationTokenParams = (token: string) => {
  return jwt.decode(token, {json : true});
};
