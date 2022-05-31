import { Request, Response } from "express";
import CurrencyService from "../services/currency.service";

class CurrencyController {
  public static async getCurrencyRate(req: Request, res: Response) {
    try {
      const { currency, date_from, date_to } = req.body;
      const currencyRate = await CurrencyService.tryGetCurrencyRate(
        currency,
        date_from,
        date_to
      );

      return res.status(200).send(currencyRate);
    } catch (error) {
      return res.status(400).send({ error });
    }
  }
}

export default CurrencyController;
