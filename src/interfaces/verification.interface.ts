export interface Verification {
  _id: string;
  email: string;
  type?: string;
  token?: string;
  code: string;
  expiresAt?: Date;
}
