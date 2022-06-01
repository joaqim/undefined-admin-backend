import { NextFunction } from "express";

class FindusMiddleware {
  public async extractBodyParams(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    next();
  }
}

export default new FindusMiddleware();
