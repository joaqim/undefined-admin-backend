const express = require('express');
const cors = require('cors');

const app = express();

// const invoices = require('./routes/invoices');
const resources = require('./routes/resources');
const token = require('./routes/token');
const refresh = require('./routes/refresh');

app.use(
  express.json({
    limit: '10mb'
  })
);

app.use(
  express.urlencoded({
    limit: '10mb',
    extended: true
  })
);

app.use(cors());
//app.use(token, invoices);

app.use(token, resources);
app.use(token, refresh);

module.exports = app;