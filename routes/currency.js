const router = require('express').Router();
const axios = require('axios');


function csvStringToObject(str) {
    let lines = str.split(EOL);
    let result = [];
    let headers = lines[0].split(",");
    for (let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split(",");
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    return r
}

router.post('/api/currency', async (req, res) => {
    try {
        if (!req.body.currency) {
            return res.status(400).send({ error: 'Param `currency` is missing' });
        }
        if (!req.body.dateTo) {
            return res.status(400).send({ error: 'Param `dateTo` is missing' });
        }
        if (!req.body.dateFrom) {
            return res.status(400).send({ error: 'Param `dateFrom` is missing' });
        }

        let { currency, dateFrom, dateTo } = req.body

        const url = `https://www.riksbank.se/sv/statistik/sok-rantor--valutakurser/?c=cAverage&f=Day&from=${dateFrom}&g130-SEK${currency}PMI=on&s=Dot&to=${dateTo}&export=csv`

        const { data } = await axios({
            method: 'GET',
            url,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });
        console.log({ data })
        res.status(200).send(data)
    } catch (error) {
        console.log('An error occurred POST /currency :', error);
        res.status(500).send(error);
    }
})


module.exports = router;