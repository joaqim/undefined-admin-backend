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

  public async extractParams(req: Request, res: Response, next: NextFunction) {
    const { page, perPage, limit, filter } = req.params;
    req.body.page = page ?? 1;
    req.body.limit = limit ?? perPage;
    // TODO: will this be used?
    req.body.per_page = req.body.limit;
    req.body.filter = filter;

    const id = req.body.id;
    const resources = capitalizeFirstLetter(
      req.body.resources ?? req.params.resources
    ) as Resources;
    // Renames "Invoices" to "Invoice" if it is a request with specific ID
    req.body.resources = id ? singularResource(resources) : resources;
    req.body.id = id;
    next();
  }

  public async validateValidResource(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const resources = req.body.resources ?? req.params.resources;
    if (!ValidResources.includes(capitalizeFirstLetter(resources) as Resources))
      return res
        .status(400)
        .send({ error: `Not a valid Fortnox resource: ${resources}` });

    next();
  }
  public async validateAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let { access_token } = req.body;
    if (!access_token) {
      return res.status(400).send({ error: "Param 'access_token' is missing" });
    }
    next();
  }

  public async validateAuthenticationCode(
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
