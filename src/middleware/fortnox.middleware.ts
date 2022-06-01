import express, { Request, Response, NextFunction } from "express";
import debug from "debug";
import {
  Resources,
  singularResource,
  ValidResources,
} from "../interfaces/fortnox/resources.interface";
import capitalizeFirstLetter from "../utils/capitalizeFirstLetter";
import FortnoxServices from "../services/fortnox/fortnox.service";

const { FORTNOX_REDIRECT_URI } = process.env;

const log: debug.IDebugger = debug("app:fortnox-middleware");
class FortnoxMiddleware {
  public async extractQuery(req: Request, res: Response, next: NextFunction) {
    const { access_token, page, perPage, limit, filter } = req.query;

    req.body.access_token = access_token;
    req.body.page = page ?? 1;
    req.body.limit = limit ?? perPage ?? 5;

    // TODO: will this be used?
    req.body.per_page = req.body.limit;

    req.body.filter = filter;

    const resources = capitalizeFirstLetter(req.params.resources) as Resources;

    const id = req.params.id;
    // Renames "Invoices" to "Invoice" if it is a request with specific ID
    req.body.resources = id ? singularResource(resources) : resources;
    req.body.id = id;

    /* console.log({ params: req.params });
    console.log({ body: req.body }); */
    next();
  }

  public async validateUpdateResourceParams(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id, data } = req.body;
    req.body.resources = singularResource(req.body.resources);
    const resources = req.body.resources;

    if (!id) {
      return res
        .status(400)
        .send({ error: `Param 'id' missing for updating ${resources}` });
    }
    if (!data) {
      return res
        .status(400)
        .send({ error: `Param 'data' missing for updating ${resources}` });
    }

    if (!data[resources]) {
      return res.status(400).send({
        error: `Invalid 'data' for updating ${resources}, expected: 'data: {"${resources}": {...}}'`,
      });
    }

    next();
  }

  public async validateCreateResourceParams(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id, data } = req.body;
    req.body.resources = singularResource(req.body.resources);
    const resources = req.body.resources;
    try {
      if (id) {
        throw new Error(`Unexpected param 'id' while creating ${resources}`);
      }

      if (!data) {
        throw new Error(`Param 'data' missing while creating ${resources}`);
      }

      if (!data[resources]) {
        throw new Error(
          `Invalid 'data' for creating ${resources}, expected: 'data: {"${resources}": {...}}'`
        );
      }

      if (resources === "Invoice") {
        if (!data[resources].CustomerNumber) {
          throw new Error(`Invoice is missing 'CustomerNumber' while creating new Invoice`);
        }
      } else if (resources === "Customers") {

      }
    } catch (error) {
      return res.status(400).send({ error });
    }

    next();
  }

  public async validateValidResource(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const resources = req.params.resources;

    if (!ValidResources.includes(capitalizeFirstLetter(resources) as Resources))
      return res
        .status(400)
        .send({ error: `Not a valid Fortnox resource: ${resources}` });

    next();
  }
  public async validateAccessTokenParams(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const access_token = req.body.access_token ?? req.query.access_token;

    if (!access_token) {
      return res.status(400).send({ error: "Param 'access_token' is missing" });
    }
    next();
  }

  public async validateAuthenticationParams(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { code, refresh_token, grant_type, redirect_uri } = req.body;

    if (!grant_type) {
      return res.status(400).send({ error: "Param `grant_type` is missing" });
    }

    if (grant_type === "authorization_code") {
      if (!code) {
        return res.status(400).send({ error: "Param `code` is missing" });
      } else if (!redirect_uri && !FORTNOX_REDIRECT_URI) {
        return res.status(400).send({
          error: "Missing 'redirect_uri' for Fortnox Authentication.",
        });
      }
    } else if (grant_type === "refresh_token") {
      if (!refresh_token) {
        return res.status(400).send({
          error: "Missing 'refresh_token'.",
        });
      } else if (code) {
        return res
          .status(400)
          .send({ error: "Unexepected param `code` on token refresh." });
      }
    } else {
      return res.status(400).send({
        error:
          "Param `grant_type` expected to be 'authorization_code'/'refresh_token' ",
      });
    }
    next();
  }

  // Arrow function to allow 'this'
  public validateResourceExists = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let { access_token, resources, id } = req.body;
    if (id) {
      const data = await FortnoxServices.getOne(access_token, resources, {
        id,
      });
      if (!data) {
        return res.status(400).send({
          error: `Resource of type ${resources} with ID: ${id} doesn't exist in Fortnox.`,
        });
      }
    }
    next();
  };
}

export default new FortnoxMiddleware();
