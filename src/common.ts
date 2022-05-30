// TODO: Is this needed?
import dotenv from "dotenv";
dotenv.config();

export const { FORTNOX_CLIENT_SECRET } = process.env;

export const FORTNOX_API_URL = "https://api.fortnox.se/3";

export const FORTNOX_DEFAULT_HEADERS = {
  "Client-Secret": FORTNOX_CLIENT_SECRET,
  "Content-Type": "application/json",
  Accept: "application/json",
};
