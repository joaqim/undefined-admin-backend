import { Application } from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import currencyMiddleware from "../middleware/currency.middleware";
import CurrencyController from "../controllers/CurrencyController";

export class CurrencyRoutes extends CommonRoutesConfig {
  constructor(app: Application) {
    super(app, "CurrencyRoutes");
  }
  configureRoutes(): Application {
    this.app
      .route("/currency/rate")
      .all(currencyMiddleware.validateCurrencyParams)
      .post(CurrencyController.getCurrencyRate);

    return this.app;
  }
}
