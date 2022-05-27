import axios from "axios";
import { Router } from "express";
import authHeader from "../utils/authHeader";

const { FORTNOX_CLIENT_ID, FORTNOX_CLIENT_SECRET, FORTNOX_REDIRECT_URI } =
  process.env;

const router = Router();

router.post("/token", async (req, res) => {
  try {
    if (!FORTNOX_CLIENT_ID || !FORTNOX_CLIENT_SECRET) {
      throw new Error(
        "Missing 'FORTNOX_CLIENT_(ID/SECRET)' in environment variables"
      );
    }

    if (!req.body.code) {
      return res.status(400).send({ error: "Param `code` is missing" });
    }

    if (!req.body.grant_type) {
      return res.status(400).send({ error: "Param `grant_type` is missing" });
    }

    const { code, grant_type, redirect_uri } = req.body;

    const authTokenUri = "https://apps.fortnox.se/oauth-v1/token";
    const params = new URLSearchParams({
      grant_type,
    });

    if (grant_type === "authorization_code") {
      if (!redirect_uri && !FORTNOX_REDIRECT_URI) {
        return res
          .status(400)
          .send({ error: "Param `redirect_uri` is missing for Authorization" });
      }

      params.append("code", code);
      params.append("redirect_uri", redirect_uri ?? FORTNOX_REDIRECT_URI);
    } else if (grant_type === "refresh_token") {
      params.append("refresh_token", code);
    } else {
      return res.status(400).send({
        error:
          "Param `grant_type` expected to be 'authorization_code'/'refresh_token' ",
      });
    }

    const { data } = await axios({
      method: "POST",
      url: authTokenUri,
      data: params.toString(),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "*",
        Authorization: authHeader(FORTNOX_CLIENT_ID, FORTNOX_CLIENT_SECRET),
      },
    });

    res.status(200).send(data);
  } catch (error) {
    console.log("An error occurred POST /token :", error);
    res.status(500).send(error);
  }
});

export default router;
