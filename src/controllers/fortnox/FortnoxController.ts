import { Request, Response } from "express";

import debug from "debug";
import FortnoxServices from "../../services/fortnox/fortnox.service";
import TokenService from "../../services/fortnox/token.service";
import { Article, Customer, Invoice } from "findus";
import {
  ListResources,
  Resources,
} from "../../interfaces/fortnox/resources.interface";

import rateLimiter from "../../utils/RateLimiter";

const log: debug.IDebugger = debug("app:invoices-controller");
class InvoicesController {
  public static async getResources(req: Request, res: Response) {
    const { access_token, resources, page, limit, id, filter, order, sort } =
      req.body;
    // await rateLimiter.SleepAsNeeded();

    if (!ListResources.includes(resources)) {
      const data = await FortnoxServices.getOne(access_token, resources, {
        id,
      });
      return res.status(200).send({ data, total: data ? 1 : 0 });
    }

    const { data, meta } = await FortnoxServices.getMany(
      access_token,
      resources,
      {
        id,
        page,
        limit,
      }
    );

    let dataArray: unknown[] = [];

    if (resources === "Invoices") {
      dataArray = (data as Invoice[]).map((value) => {
        return { ...value, id: value.DocumentNumber };
      });
    } else if (resources === "Customers") {
      dataArray = (data as Customer[]).map((value) => {
        return { ...value, id: value.CustomerNumber };
      });
    } else if (resources === "Articles") {
      dataArray = (data as Article[]).map((value) => {
        return { ...value, id: value.ArticleNumber };
      });
    }

    res.status(200).send({ data: dataArray, total: data.length, meta });
  }

  public static async token(req: Request, res: Response) {
    let { code, refresh_token, grant_type, redirect_uri } = req.body;
    // await rateLimiter.SleepAsNeeded();
    try {
      const { data } = await TokenService.axiosRequest(
        code ?? refresh_token,
        grant_type,
        redirect_uri
      );
      console.log(data);
      return res.status(200).send(data);
    } catch (error) {
      res.status(400).send({ error });
    }
  }

  /*
  public static async getInvoiceById(req: Request, res: Response) {
    const invoice = await invoicesService.create(req.body)
    res.status(200).send(invoice);
  }

  public static async createInvoice(req: Request, res: Response) {
    const invoice = await invoicesService.create(req.body)
    res.status(201).send(invoice);
  }

  public static async update(req: Request, res: Response) {
    log(await invoicesService.putById(req.body.id, req.body));
    res.status(204).send();
  }

  public static async removeInvoice(req: Request, res: Response) {
    log(await invoicesService.deleteById(req.body.id));
    res.status(204).send();
  }
  */
}

export default InvoicesController;
