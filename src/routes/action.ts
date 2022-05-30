import Axios from "axios";
import { Router } from "express";
import { Invoice } from "findus";
import { FORTNOX_API_URL, FORTNOX_DEFAULT_HEADERS } from "../common";
import createURL from "../utils/createURL";
import { sendBackFortnoxData } from "../utils/fortnoxUtils";

const router = Router();

router.post("/action/:resource/:id/:action", async (req, res) => {
  let { resource, id, action } = req.params;

  const url = createURL(FORTNOX_API_URL, resource + "s", { id, action });

  let { access_token, invoice }: { access_token: string; invoice: Invoice } =
    req.body;

  if (!access_token) {
    return res.status(400).send({ error: "Param `access_token` is missing" });
  }
  if (!invoice) {
    return res.status(400).send({ error: "Param `invoice` is missing" });
  }

  const { data } = await Axios({
    method: "PUT",
    url,
    data: { Invoice: invoice },
    headers: {
      ...FORTNOX_DEFAULT_HEADERS,
      "Access-Control-Allow-Origin": "*",
      "Access-Token": access_token,
    },
  });

  return sendBackFortnoxData<Invoice>(data, "Inovice", res);
});

export default router;
