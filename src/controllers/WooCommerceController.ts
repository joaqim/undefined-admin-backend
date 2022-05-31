import { Request, Response } from "express";
import WooCommerceService from "../services/woocommerce.service";

class WooCommerceController {
  public static async getResources(req: Request, res: Response) {
    const {
      storefront_url,
      consumer_key,
      consumer_secret,
      resources,
      status,
      id,
      date_from,
      date_to,
    } = req.body;

    const page = req.body.page ?? 1;
    const perPage = req.body.per_page ?? 5;

    try {
      if (resources === "Orders") {
        const { data, headers } = await WooCommerceService.getOrders(
          storefront_url,
          consumer_key,
          consumer_secret,
          {
            status,
            id,
            dateFrom: date_from,
            dateTo: date_to,
            page,
            perPage,
          }
        );

        const total = headers["x-wp-total"];
        res.set({
          "Access-Control-Expose-Headers": ["Content-Range", "X-Total-Count"],
          "Access-Control-Allow-Methods": "*",
          "X-Total-Count": total,
          "Content-Range": `${resources}:${page}-${perPage}/${total}`,
        });
        res.status(200).send({ data, total: data.length });
      } else {
        throw new Error(`Unsupported WooCommerce resource: ${resources}`);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

export default WooCommerceController;
