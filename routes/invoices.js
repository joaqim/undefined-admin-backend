const router = require('express').Router();
const axios = require('axios');

const fortnoxApiUrl = "https://api.fortnox.se/3"
const { FORTNOX_CLIENT_SECRET } = process.env

router.post('/invoices', async (req, res) => {
  try {
    if (!req.body.access_token) {
      return res.status(400).send({ error: 'Param `access_token` is missing' });
    }

    let { access_token } = req.body

    const url = `${fortnoxApiUrl}/invoices/?limit=1&page=1`

    console.log("Getting invoices")
    const { data } = await axios({
      method: 'GET',
      url,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${access_token}`,
        'Client-Secret': FORTNOX_CLIENT_SECRET,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    })

    console.log({ data })

    let totalCount = data.Invoices.count
    res.set({
      'Access-Control-Expose-Headers': ['Content-Range', 'X-Total-Count'],
      'Access-Control-Allow-Methods': '*',
      'X-Total-Count': totalCount,
      'Content-Range': `invoices:${0}-${10}/${totalCount}`
    });

    data.Invoices.forEach((invoice, index) => invoice.id = index)

    res.status(200).send(data);


  } catch (error) {
    console.log('An error occurred POST /invoices :', error);
    res.status(500).send(error);
  }
})

module.exports = router;