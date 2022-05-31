import { NextFunction, Request, Response } from "express";

class CurrencyMiddleware {
  public async validateCurrencyParams(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let { currency, date_to, date_from } = req.body;

    if (!currency) {
      return res.status(400).send({ error: "Param `currency` is missing" });
    }
    if (!date_to) {
      return res.status(400).send({ error: "Param `date_to` is missing" });
    }
    if (!date_from) {
      return res.status(400).send({ error: "Param `date_from` is missing" });
    }

    next();
  }
}

export default new CurrencyMiddleware();