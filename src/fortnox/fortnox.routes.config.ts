import { CommonRoutesConfig } from "../common/common.routes.config";
import { Application, NextFunction, Request, Response } from "express";
import InvoicesController from "./controllers/FortnoxController";
import fortnoxMiddleware from "./middleware/fortnox.middleware";
import TokenService from "./services/token.service";
import FortnoxController from "./controllers/FortnoxController";

export class FortnoxRoutes extends CommonRoutesConfig {
  constructor(app: Application) {
    super(app, "FortnoxRoutes");
  }

  configureRoutes() {
    //this.app.route("/fortnox/invoices").get(InvoicesController.listInvoices);

    this.app
      .route("/fortnox/token")
      .all(fortnoxMiddleware.validateAuthenticationCode)
      .post(FortnoxController.token);

    this.app.param(`id`, fortnoxMiddleware.extractParamID);
    this.app.param(`resources`, fortnoxMiddleware.extractParamResources);
    this.app.param(`action`, fortnoxMiddleware.extractParamAction);

    this.app
      .route("/fortnox/:resources/:id?")
      .all(
        fortnoxMiddleware.validateAccessToken,
        fortnoxMiddleware.validateResourceExists,
        fortnoxMiddleware.validatePagination
      )
      .post(FortnoxController.listResources);

    this.app
      .route("/fortnox/:resources/:id/:action")
      .all(
        fortnoxMiddleware.validateAccessToken,
        fortnoxMiddleware.validateResourceExists
      )
      .get((req: Request, res: Response) => {
        const { resources, id, action } = req.body;
        res.status(200).send(`GET ${action} in ${resources} for ${id}`);
      })
      .put((req: Request, res: Response) => {
        const { resources, id, action } = req.body;
        res.status(200).send(`PUT ${action} in ${resources} for ${id}`);
      });
    return this.app;
  }
}
