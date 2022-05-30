import express, { Request, Response, NextFunction } from "express";
import debug from "debug";
import InvoicesService from "../services/invoices.service";
import FortnoxServices from "../services/fortnox.service";
import { Resources, ValidResources } from "../interfaces/resources.interface";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";

const { FORTNOX_REDIRECT_URI } = process.env;

const log: debug.IDebugger = debug("app:fortnox-middleware");
class FortnoxMiddleware {
  public async extractParamResources(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    req.body.resources = capitalizeFirstLetter(req.params.resources);
    next();
  }
  public async extractParamID(req: Request, res: Response, next: NextFunction) {
    req.body.id = req.params.id;
    next();
  }
  public async extractParamAction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    req.body.action = req.params.action;
    next();
  }

  public async validatePagination(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { page, perPage, limit } = req.params;
    req.body.page = page ?? 1;
    req.body.limit = limit ?? perPage;
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
    const { code, grant_type, redirect_uri } = req.body;

    if (!code) {
      return res.status(400).send({ error: "Param `code` is missing" });
    }

    if (!grant_type) {
      return res.status(400).send({ error: "Param `grant_type` is missing" });
    }

    if (grant_type === "authorization_code") {
      if (!redirect_uri && !FORTNOX_REDIRECT_URI) {
        return res.status(400).send({
          error: "Missing 'redirect_uri' for Fortnox Authentication.",
        });
      }
    } else if (grant_type !== "refresh_token") {
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
    this.validateValidResource(req, res, next);
    let { resource, id } = req.body;
    if (id) {
      const result = await FortnoxServices.getResource(
        resource,
        { method: "GET" },
        {
          id,
        }
      );
      if (!result) {
        return res.status(400).send({
          error: `Resorce of ${resource} with ID: ${id} doesn't exist in Fortnox.`,
        });
      }
    }
    next();
  };
}

export default new FortnoxMiddleware();
