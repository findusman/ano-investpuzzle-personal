import { AuthProvider, STATUS, USER_GENDER } from "_app/enums";

export interface User {
  _id: string;
  email: string;
  emailVerified?: true;
  username: string;
  userFullName: string;
  education: string;
  otherEducation: string;
  country: string;
  pronoun: string;
  otherPronouns: string;
  socialId: string;
  photoUrl?: string;
  localId?: string;
  coverImage?: string;
  passwordHash: string;
  yearOfBirth: string;
  loginType: string; // email, appple, google
  lastSignedInAt: String;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
  availableFunds: number;
  initFunds: number;
  jwt: string;
  followers?: number;
  following?: number;
  followed?: boolean;
  status: STATUS;
  token: string;
  professor: string;

  userType: number, // 0: professor, 1: student
  //====== For professors only===========
  userPhone: string,
  universityName: string,
  title: string,
  fundName: string,
  fundsAum: string,
  endOfSubscriptionDate: Date,
  totalSubscribedNumberOfStudents: number,
  inviteCode: string,
  isApprovedByProfessor: boolean,
}

export interface UserProfile {
  user: string;
  username: string;
  firstName: string;
  lastName: string;
  language: string;
  interests: Array<string>;
  gender?: USER_GENDER;
  photoUrl?: string;
  coverImage?: string;
  bio?: string;
  discordId?: string;
  twitterId?: string;
  instagramId?: string;
  website?: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;

  userType: String, // 0: professor, 1: student
  //====== For professors only===========
  userPhone: string,
  universityName: string,
  title: string,
  fundName: string,
  fundsAum: number,
  endOfSubscriptionDate: Date,
  totalSubscribedNumberOfStudents: number,
  inviteCode: string,
  isApprovedByProfessor: boolean,
}

export interface UserFollow {
  _id: string;
  user: string;
  leader: string;
  isAccepted: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Pronouns {
  _id: string;
  title: string;
}

export interface Education {
  _id: string;
  title: string;
}

export interface Country {
  _id: string;
  name: string;
  code: string;
  capital: string;
  region: string;
  currency: object;
  flag: string;
}
