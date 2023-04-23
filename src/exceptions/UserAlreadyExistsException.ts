import HttpException from "./HttpException";

class UserAlreadyExistsException extends HttpException {
  constructor(email: string, isAdmin: boolean = false) {
    super(409, `User with email ${email} already exists`);
  }
}

export default UserAlreadyExistsException;
