const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
// import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { Router } from "express";
import axios from "axios";
import os from "os";
import fs from "fs";
import createURL from "../utils/createURL";

import { Article, Customer, Invoice } from "findus";
import { sendBackFortnoxData } from "../utils/fortnoxUtils";
import { FORTNOX_API_URL, FORTNOX_DEFAULT_HEADERS } from "../common";
import Axios from "axios";
import { Blob } from "buffer";

const router = Router();

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

type WooCommerceResponse = {
  data: any;
  headers: {
    "x-wp-total": number;
    //[x: string]: any;
  };
};

type WooCommerceError = {
  response: {
    status: number;
    headers: any;
    data: any;
  };
};
type Resources = "invoices";

type TitleCase<T extends string, D extends string = " "> = string extends T
  ? never
  : T extends `${infer F}${D}${infer R}`
  ? `${Capitalize<F>}${D}${TitleCase<R, D>}`
  : Capitalize<T>;

router.post("/retrieve/:resources/:id?", async (req, res) => {
  // let { resources, id }: { resources?: string; id?: string } = req.params;
  let { resources, id } = req.params;
  let {
    sort,
    filter,
    page,
    perPage,
  }: {
    sort?: { field: string; order: "ASC" | "DEC" };
    filter?: Record<string, any>;
    page?: string;
    perPage?: string;
  } = req.body;

  // sort, // field: string, order: string
  //filter, // [k: string]: any
  //pagination, // page: number, perPage: number

  if (resources === "wc-orders") {
    try {
      let {
        consumer_key,
        consumer_secret,
        storefront_url,
      }: {
        consumer_key?: string;
        consumer_secret?: string;
        storefront_url?: string;
      } = req.body;
      if (!consumer_key) {
        return res
          .status(400)
          .send({ error: "Param `consumer_key` is missing" });
      }
      if (!consumer_secret) {
        return res
          .status(400)
          .send({ error: "Param `consumer_secret` is missing" });
      }
      if (!storefront_url) {
        return res
          .status(400)
          .send({ error: "Param `storefront_url` is missing" });
      }
      const api = new WooCommerceRestApi({
        url: storefront_url,
        consumerKey: consumer_key,
        consumerSecret: consumer_secret,
        version: "wc/v2",
      });

      return api
        .get(resources.slice(3), {
          page: page,
          per_page: perPage,
        })
        .then((response: WooCommerceResponse) => {
          // Successful request
          //console.log("Response Status:", response.status);
          //console.log("Response Headers:", response.headers);
          //console.log("Response Data:", response.data);
          //console.log("Total of pages:", response.headers['x-wp-totalpages']);
          let data = response.data;
          let total = response.headers["x-wp-total"];
          res.set({
            "Access-Control-Expose-Headers": ["Content-Range", "X-Total-Count"],
            "Access-Control-Allow-Methods": "*",
            "X-Total-Count": total,
            "Content-Range": `${resources}:${page}-${perPage}/${total}`,
          });
          res.status(200).send(data);
        })
        .catch((error: WooCommerceError) => {
          // Invalid request, for 4xx and 5xx statuses
          console.log("Response Status:", error.response.status);
          console.log("Response Headers:", error.response.headers);
          console.log("Response Data:", error.response.data);
          res.status(error.response.status).send(error);
        })
        .finally(() => {
          // Always executed.
        });

      //console.log(`fetching ${resources.slice(3)} from WooCommerce`);
      //return await api.get(resources.slice(3) + (id ? `/${id}` : ""), { per_page: 5 });
    } catch (error) {
      console.log("An error occurred POST /wc-orders :", error);
      return res.status(500).send(error);
    }
  } else if (resources === "pdf") {
    const { documentLink }: { documentLink?: string } = req.body;
    if (!documentLink) {
      return res
        .status(400)
        .send({ error: "Param 'documentLink' is missing from body." });
    }

    let { data }: { data: any } = await Axios({
      method: "GET",
      url: documentLink,
      headers: {
        Accept: "application/pdf",
      },
      responseType: "arraybuffer",
    });
    if (!data) {
      return res
        .status(400)
        .send({ error: `Failed to retrieve PDF, check url: ${documentLink}` });
    }

    let buffer = Buffer.from(data);

    res.set({
      "Cache-Control": "public",
      "Content-Type": "application/pdf",
      "Content-Length": buffer.length,
      "Content-Transfer-Encoding": "binary",
      "Accept-Ranges": "bytes",
    });

    return res.status(200).send(data);
  } else if (resources === "currency") {
    try {
      if (!req.body.currency) {
        return res.status(400).send({ error: "Param `currency` is missing" });
      }
      if (!req.body.dateTo) {
        return res.status(400).send({ error: "Param `dateTo` is missing" });
      }
      if (!req.body.dateFrom) {
        return res.status(400).send({ error: "Param `dateFrom` is missing" });
      }

      let { currency, dateFrom, dateTo } = req.body;

      const url = `https://www.riksbank.se/sv/statistik/sok-rantor--valutakurser/?c=cAverage&f=Day&from=${dateFrom}&g130-SEK${currency}PMI=on&s=Dot&to=${dateTo}&export=csv`;

      const { data } = await axios({
        method: "GET",
        url,
        headers: {
          "Content-Type": "*/*",
        },
      });

      let csvArray = data
        .replace(os.EOL, "")
        .split("\r")
        .map((value: string) => {
          if (value === "\n") return;
          return value.replace("\n", "");
        });
      let [, ...currencies] = csvArray;
      if (currencies.length < 2)
        throw new Error("Unexpected result from riksbank.se");
      let currencyRow = currencies[currencies.length - 2];
      let currencyRate = currencyRow.slice(
        currencyRow.lastIndexOf(`${currency};`) + 4
      );
      res.status(200).send(currencyRate);
    } catch (error) {
      console.log("An error occurred POST /currency :", error);
      return res.status(500).send(error);
    }
  } else {
    try {
      if (!req.body.access_token) {
        return res
          .status(400)
          .send({ error: "Param `access_token` is missing" });
      }

      const { access_token } = req.body;

      const url = createURL(FORTNOX_API_URL, resources, {
        id,
        page,
        limit: perPage,
      });

      const { data } = await axios({
        method: "GET",
        url,
        headers: {
          ...FORTNOX_DEFAULT_HEADERS,
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${access_token}`,
        },
      });
      switch (resources) {
        case "invoices":
          return sendBackFortnoxData<Invoice[]>(data, "Invoices", res);
        case "articles":
          return sendBackFortnoxData<Article[]>(data, "Articles", res);
        case "orders":
          throw new Error("Fortnox Orders are not supported yet");
        // return returnFortnoxData<Order[]>(data, "Orders", res);
        case "customers":
          return sendBackFortnoxData<Customer[]>(data, "Customers", res);
        default:
          throw new Error(`Unsupported resource: ${resources}`);
          break;
      }
    } catch (error) {
      console.log(`An error occurred GET /:resources/:id? :`, error);
      return res.status(500).send(error);
    }
  }
});

export default router;
