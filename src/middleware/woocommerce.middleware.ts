import { NextFunction, Request, Response } from "express";
import {
  Resources,
  ValidResources,
} from "../interfaces/woocommerce/resources.interface";
import capitalizeFirstLetter from "../utils/capitalizeFirstLetter";

class WooCommerceMiddleware {
  public async extractParams(req: Request, res: Response, next: NextFunction) {
    const { resources, id } = req.params;

    req.body.id = id;
    req.body.resources = capitalizeFirstLetter(resources);

    console.log({ params: req.params });
    console.log({ body: req.body });

    next();
  }

  public async validateValidResource(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const resources = req.body.resources; // ?? req.params.resources;
    if (!ValidResources.includes(resources as Resources))
      return res
        .status(400)
        .send({ error: `Not a valid WooCommerce resource: ${resources}` });
    next();
  }

  public async validateAuthKeyParams(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { consumer_key, consumer_secret, storefront_url, resources } =
      req.body;

    if (!resources) {
      return res.status(400).send({ error: "Param `resources` is missing" });
    }

    if (!storefront_url) {
      return res
        .status(400)
        .send({ error: "Param `storefront_url` is missing" });
    }

    if (!consumer_key) {
      return res.status(400).send({ error: "Param `consumer_key` is missing" });
    }

    if (!consumer_secret) {
      return res
        .status(400)
        .send({ error: "Param `consumer_secret` is missing" });
    }

    next();
  }

  public validateRequiredParams = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id, resources, status, date_from, date_to } = req.body;

    if (!id) {
      if (resources === "refunds") {
        return res.status(400).send({
          error: `Param 'id' is required for fetching ${resources}`,
        });
      } else if (resources === "orders") {
        if (!status) {
          return res.status(400).send({
            error: `Param 'status' is required for fetching multiple ${resources}`,
          });
        }
        if (!date_from) {
          return res.status(400).send({
            error: `Param 'date_from' is required for fetching multiple ${resources}`,
          });
        }
        if (!date_to) {
          return res.status(400).send({
            error: `Param 'date_to' is required for fetching multiple ${resources}`,
          });
        }
      }
    }

    next();
  };
}

export default new WooCommerceMiddleware();
