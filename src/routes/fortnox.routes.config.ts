import { CommonRoutesConfig } from "../common/common.routes.config";
import { Application, Request, Response } from "express";
import fortnoxMiddleware from "../middleware/fortnox.middleware";
import FortnoxController from "../controllers/FortnoxController";

export class FortnoxRoutes extends CommonRoutesConfig {
  constructor(app: Application) {
    super(app, "FortnoxRoutes");
  }

  configureRoutes() {
    //this.app.route("/fortnox/invoices").get(InvoicesController.listInvoices);

    this.app
      .route("/fortnox/token")
      .all(fortnoxMiddleware.validateAuthenticationParams)
      .post(FortnoxController.token);

    this.app
      .route(
        "/fortnox/:resources/:id?"
      )
      .all(
        fortnoxMiddleware.validateValidResource,
        fortnoxMiddleware.validateAccessTokenParams
      )
      .get(
        fortnoxMiddleware.extractQuery,
        fortnoxMiddleware.validateResourceExists,
        FortnoxController.getResources
      )
      .put(
        fortnoxMiddleware.validateUpdateResourceParams,
        FortnoxController.updateResource
      )
      .post(
        fortnoxMiddleware.validateCreateResourceParams,
        FortnoxController.createResource
      );

    this.app
      .route("/fortnox/:resources/:id/:action")
      .all(
        fortnoxMiddleware.extractQuery
        /* fortnoxMiddleware.validateValidResource,
        fortnoxMiddleware.validateAccessTokenParams,
        fortnoxMiddleware.validateResourceExists */
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
