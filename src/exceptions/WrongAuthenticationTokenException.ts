import HttpException from "./HttpException";

class WrongAuthenticationTokenException extends HttpException {
  constructor(message?: string) {
    super(401, message || "Wrong authentication token");
  }
}

export default WrongAuthenticationTokenException;
