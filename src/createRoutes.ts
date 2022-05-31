import { Application } from "express";
import { CommonRoutesConfig } from "./common/common.routes.config";
import { FortnoxRoutes } from "./routes/fortnox.routes.config";
import { WooCommerceRoutes } from "./routes/woocommerce.routes.config";
import { CurrencyRoutes } from "./routes/currency.routes.config";

const createRoutes = (app: Application): Array<CommonRoutesConfig> => [
  new FortnoxRoutes(app),
  new CurrencyRoutes(app),
  new WooCommerceRoutes(app),
];

export default createRoutes;
