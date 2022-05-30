import { Application } from "express";
import { CommonRoutesConfig } from "./common/common.routes.config";
import { FortnoxRoutes } from "./fortnox/fortnox.routes.config";

const createRoutes = (app: Application): Array<CommonRoutesConfig> => [
  new FortnoxRoutes(app),
];

export default createRoutes;
