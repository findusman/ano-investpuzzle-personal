export interface DataStoredInToken {
  _id: string;
  isAdmin?: boolean;
  tokentype: number; //0: login token, 1: signup token, 2: forgot token
  email? : string;
  username? : string;
  code? : string;
}
