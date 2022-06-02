import Axios from "axios";
import { Request, Response } from "express";
import { MetaData, WcOrder, WcOrders } from "findus";
import WooCommerceService from "../services/woocommerce.service";

class WooCommerceController {
  private static tryGetDocumentLink = (
    order: WcOrder,
    storefrontUrl?: string
  ): string => {
    // Try to get Document link from metadata
    const pdfLink = order.meta_data.find(
      (entry: MetaData) => entry.key === "_wcpdf_document_link"
    )?.value as string;

    if (pdfLink && pdfLink !== "") {
      return pdfLink;
    } else {
      // Try to get Order key from metadata
      let orderKey = order.meta_data.find(
        (entry: MetaData) => entry.key === "_wc_order_key"
      )?.value;

      if (!orderKey) {
        orderKey = order.order_key;
      }

      if (!orderKey) {
        throw new Error(`Order is missing document_link and order_key`);
      }

      function fixedEncodeURI(url: string) {
        return encodeURI(url).replace(/%5B/g, "[").replace(/%5D/g, "]");
      }

      if (!storefrontUrl) {
        const url = order.meta_data.find(
          (entry: MetaData) => entry.key === "storefront_url"
        )?.value;
        if (!url) {
          throw new Error(
            `Could not get 'storefront_url' from order meta_data`
          );
        }
        return fixedEncodeURI(
          `${url}/wp-admin/admin-ajax.php?action=generate_wpo_wcpdf&template_type=invoice&order_ids=${order.id}&order_key=${orderKey}`
        );
      }

      return fixedEncodeURI(
        `${storefrontUrl}/wp-admin/admin-ajax.php?action=generate_wpo_wcpdf&template_type=invoice&order_ids=${order.id}&order_key=${orderKey}`
      );
    }
  };

  private static tryAddOrderMetaData = async (
    order: WcOrder,
    storefront_url: string,
    storefront_prefix?: string
  ): Promise<MetaData[]> => {
    const pdfLink = this.tryGetDocumentLink(order, storefront_url);
    console.log({ pdfLink });

    const { data: pdfData }: { data: any } = await Axios({
      method: "GET",
      url: pdfLink,
      headers: {
        Accept: "application/pdf",
      },
      responseType: "arraybuffer",
    });

    if (!pdfData) {
      throw new Error(
        `Failed to retrieve PDF, check if url is valid: ${pdfLink}`
      );
    }

    const createDocumentSrc = (pdfBinary: string) => {
      const base64 = Buffer.from(pdfBinary, "base64");
      return "data:application/pdf;base64," + base64;
    };

    if (storefront_prefix) {
      order.meta_data.push({
        key: "storefront_prefix",
        value: storefront_prefix,
      });
    }

    order.meta_data = [
      ...order.meta_data,
      {
        key: "storefront_url",
        value: storefront_url,
      },
      {
        key: "_wcpdf_document_link",
        value: pdfLink,
      },
      {
        key: "pdf_invoice_source",
        value: createDocumentSrc(pdfData),
      },
    ];

    return order.meta_data;
  };

  public static getResources = async (req: Request, res: Response) => {
    const {
      storefront_url,
      storefront_prefix,
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

        for (let order of data) {
          order.meta_data = await this.tryAddOrderMetaData(
            order,
            storefront_url,
            storefront_prefix
          );
          // await this.tryAddOrderMetaData(order, storefront_url, storefront_prefix);
        }

        res.status(200).send({ data, total: data.length });
      } else {
        throw new Error(`Unsupported WooCommerce resource: ${resources}`);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

export default WooCommerceController;
