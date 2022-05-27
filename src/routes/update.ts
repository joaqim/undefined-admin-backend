import Axios from "axios";
import { Router } from "express";
import { Invoice } from "findus";
import createURL from "../utils/createURL";
import { sendFortnoxData } from "../utils/fortnoxUtils";

const router = Router();


const fortnoxApiUrl = "https://api.fortnox.se/3";
const { FORTNOX_CLIENT_SECRET } = process.env;
const FORTNOX_DEFAULT_HEADERS = {
  "Client-Secret": FORTNOX_CLIENT_SECRET,
  "Content-Type": "application/json",
  Accept: "application/json",
};

router.post("/update/:resource/:id?", async (req, res) => {
  let { resource, id } = req.params;

  // TODO: use dictonary for pluralizing resource name
  const url = createURL(fortnoxApiUrl, resource + "s", {
    id,
  });

  if (resource == "invoice") {
    let { access_token, invoice } = req.body;

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

    return sendFortnoxData<Invoice>(data, "Invoice", res);
  }
});

export default router;
