import cors from "cors";
import express from "express";

const app = express();

import retrieve from "./routes/retrieve";
import action from "./routes/action";
import update from "./routes/update";
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
app.use(token, retrieve);
app.use(token, action);
app.use(token, update);

export default app;
