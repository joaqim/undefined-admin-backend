import Axios from "axios";
import { Router } from "express";
import { FORTNOX_API_URL, FORTNOX_CLIENT_SECRET } from "../common";
import createURL from "../utils/createURL";
import { sendBackFortnoxData } from "../utils/fortnoxUtils";

const router = Router();

router.post("/inbox/:action/:id", async (req, res) => {
  let { action, id } = req.params;

  let { access_token, documentData } = req.body;

  if (!access_token) {
    return res.status(400).send({ error: "Param `access_token` is missing" });
  }

  // Default folder for Customer Invoices
  let path = req.body.path ?? "Inbox_kf";

  try {
    if (action === "upload") {
      const form = new FormData();
      form.append("file", documentData);
      const url = createURL(FORTNOX_API_URL, "inbox", { path });

      let { data } = await Axios.post(url, form, {
        headers: {
          "Content-Type": "application/pdf",
          "Access-Token": access_token,
          "Client-Secret": FORTNOX_CLIENT_SECRET,
        },
      });
      return res.status(200).send(data);
    } else if (action === "delete") {
      if (!id || id === "0" || id === "") {
        throw new Error(`Invalid id for Inbox File: ${id}`);
      }
      const url = createURL(FORTNOX_API_URL, "inbox", { id });
      await Axios({
        method: "DELETE",
        url,
        headers: {
          "Access-Token": access_token,
          "Client-Secret": FORTNOX_CLIENT_SECRET,
        },
      });
    }
  } catch (error) {
    console.log(`An error occurred POST /inbox :`, error);
    return res.status(500).send(error);
  }
});

export default router;
