import { Request, Response } from "express";

import debug from "debug";

import InvoicesService from "../services/invoices.service";
import TokenService from "../services/token.service";
import FortnoxServices from "../services/fortnox.service";

const log: debug.IDebugger = debug("app:invoices-controller");
class InvoicesController {
  public static async listInvoices(req: Request, res: Response) {
    const { page, limit } = req.body;

    const invoices = await InvoicesService.list(page, limit);
    res.status(200).send(invoices);
  }

  public static async listResources(req: Request, res: Response) {
    const { resources, page, limit } = req.body;
    const invoices = await FortnoxServices.list(resources, { page, limit });
    res.status(200).send(invoices);
  }

  public static async token(req: Request, res: Response) {
    let { code, grant_type, redirect_uri } = req.body;
    try {
      const { data } = await TokenService.axiosRequest(
        code,
        grant_type,
        redirect_uri
      );
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
