import HttpException from "./HttpException";

class AlreadyExistsException extends HttpException {
  constructor(message?: string) {
    super(409, message || "Already exists");
  }
}

export default AlreadyExistsException;
