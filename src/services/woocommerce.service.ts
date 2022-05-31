const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

import { Resources } from "../interfaces/woocommerce/resources.interface";

export interface WooGetManyParams {
  id?: string;
  dateFrom?: string;
  dateTo?: string;

  status: string;
  page: number;
  perPage: number;
}

export interface WooGetOneParams {
  id: string;
  status: string;
}

class WooCommerceService {
  private static async get(
    resources: Resources,
    storeUrl: string,
    consumerKey: string,
    consumerSecret: string,
    params: WooGetManyParams | WooGetOneParams
  ) {
    const api = new WooCommerceRestApi({
      url: storeUrl,
      consumerKey,
      consumerSecret,
      version: "wc/v2",
    });

    const { id, status } = params;
    if (id) return api.get(resources, { id, status });

    if (resources === "Orders") {
      const { page, perPage, dateFrom, dateTo } = params as WooGetManyParams;
      return api.get(resources, {
        page: page,
        per_page: perPage,
        date_to: dateTo,
        date_from: dateFrom,
        status,
      });
    }
  }

  public static getOrders = async (
    storeUrl: string,
    consumerKey: string,
    consumerSecret: string,
    params: WooGetManyParams
  ) => {
    return await this.get(
      "Orders",
      storeUrl,
      consumerKey,
      consumerSecret,
      params
    );
  };
}

export default WooCommerceService;
