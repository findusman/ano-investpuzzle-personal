import { Request } from "express";

export interface RequestWithSignup extends Request {
  email: string;
  username: string;
  code: string;
  token: string;
}

export interface RequestWithProfessorSignup extends Request {
  userFullName: string;
  email: string;
  username: string;
  password: string;
  userPhone: string;
  universityName: string;
  title: string;
  fundName: string;
  fundsAum: number;
}
