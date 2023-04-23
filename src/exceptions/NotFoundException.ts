import HttpException from "./HttpException";

class NotFoundException extends HttpException {
  constructor(object: string = "Object") {
    super(404, `${object} not found`);
  }
}

export default NotFoundException;
