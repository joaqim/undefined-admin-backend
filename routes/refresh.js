const router = require('express').Router();
const axios = require('axios');
const url = require('url')
const authHeader = require('../utils/authHeader')

const { FORTNOX_CLIENT_ID, FORTNOX_CLIENT_SECRET } = process.env;

router.post('/refresh', async (req, res) => {
  try {
    if (!req.body.refresh_token) {
      return res.status(400).send({ error: 'Param `refresh_token` is missing' });
    }

    const authTokenUri = "https://apps.fortnox.se/oauth-v1/token"
    const params = new url.URLSearchParams({
      code: req.body.refresh_token,
      grant_type: 'refresh_token',
    })
    const { data } = await axios({
      method: 'POST',
      url: authTokenUri,
      data: params.toString(),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        'Authorization': authHeader(FORTNOX_CLIENT_ID, FORTNOX_CLIENT_SECRET)
      },
    });

    res.status(200).send(data);
  } catch (error) {
    console.log('An error occurred POST /refresh :', error);
    res.status(500).send(error);
  }
})

module.exports = router;
