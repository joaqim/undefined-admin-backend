import cors from "cors";
import express from "express";

const app = express();

import resources from "./routes/resources";
import token from "./routes/token";

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
  })
);

app.use(cors());
app.use(token, resources);

export default app;
