import { CommonRoutesConfig } from "../common/common.routes.config";
import { Application, NextFunction, Request, Response } from "express";

import wooCommerceMiddleware from "../middleware/woocommerce.middleware";
import WooCommerceController from "../controllers/WooCommerceController";

export class WooCommerceRoutes extends CommonRoutesConfig {
  constructor(app: Application) {
    super(app, "WooCommerceRoutes");
  }
  configureRoutes(): Application {
    this.app
      .route("/woo/:resources/:id?")
      .get(wooCommerceMiddleware.extractParams)
      .all(
        wooCommerceMiddleware.validateRequiredParams,
        wooCommerceMiddleware.validateValidResource,
        wooCommerceMiddleware.validateAuthKeyParams
      )
      .get(WooCommerceController.getResources);
    return this.app;
  }
}
