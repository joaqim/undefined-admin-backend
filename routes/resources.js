const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const router = require('express').Router();
const axios = require('axios');
const os = require('os');

const fortnoxApiUrl = "https://api.fortnox.se/3"
const { FORTNOX_CLIENT_SECRET } = process.env

const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function csvStringToObject(str) {
    let lines = str.split('\r').split(os.EOL);
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
    return result;
}

router.post('/:resources/:id?', async (req, res) => {
    let { resources, id, } = req.params;
    let { sort, filter, page, perPage } = req.body

    // sort, // field: string, order: string
    //filter, // [k: string]: any
    //pagination, // page: number, perPage: number

    if (resources === "wc-orders") {
        try {
            let { consumer_key, consumer_secret, storefront_url } = req.body
            if (!consumer_key) {
                return res.status(400).send({ error: 'Param `consumer_key` is missing' });
            }
            if (!consumer_secret) {
                return res.status(400).send({ error: 'Param `consumer_secret` is missing' });
            }
            if (!storefront_url) {
                return res.status(400).send({ error: 'Param `storefront_url` is missing' });
            }
            const api = new WooCommerceRestApi({
                url: storefront_url,
                consumerKey: consumer_key,
                consumerSecret: consumer_secret,
                version: "wc/v2",
            });
            page = page ?? 1
            perPage = page ?? 5
            return api.get(resources.slice(3), {
                page: page,
                per_page: perPage,
            })
                .then((response) => {
                    // Successful request
                    //console.log("Response Status:", response.status);
                    //console.log("Response Headers:", response.headers);
                    //console.log("Response Data:", response.data);
                    //console.log("Total of pages:", response.headers['x-wp-totalpages']);
                    let data = response.data;
                    let total = response.headers['x-wp-total'];
                    res.set({
                        'Access-Control-Expose-Headers': ['Content-Range', 'X-Total-Count'],
                        'Access-Control-Allow-Methods': '*',
                        'X-Total-Count': total,
                        'Content-Range': `${resources}:${page}-${perPage}/${total}`
                    });
                    res.status(200).send(data)
                })
                .catch((error) => {
                    // Invalid request, for 4xx and 5xx statuses
                    console.log("Response Status:", error.response.status);
                    console.log("Response Headers:", error.response.headers);
                    console.log("Response Data:", error.response.data);
                    res.status(error.response.status).send(error);
                })
                .finally(() => {
                    // Always executed.
                });

            //console.log(`fetching ${resources.slice(3)} from WooCommerce`);
            //return await api.get(resources.slice(3) + (id ? `/${id}` : ""), { per_page: 5 });

        } catch (error) {
            console.log('An error occurred POST /wc-orders :', error);
            return res.status(500).send(error);

        }
    } else if (resources === "currency") {
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
                    'Content-Type': '*/*'
                }
            });

            let csvArray = data.replace(os.EOL, "").split("\r").map((value) => {
                if (value === "\n") return;
                return value.replace("\n", "")
            })
            let [, ...currencies] = csvArray;
            if (currencies.length < 2) throw new Error("Unexpected result from riksbank.se");
            let currencyRow = currencies[currencies.length - 2]
            let currencyRate = currencyRow.slice(currencyRow.lastIndexOf(`${currency};`) + 4)
            res.status(200).send(currencyRate)
        } catch (error) {
            console.log('An error occurred POST /currency :', error);
            return res.status(500).send(error);

        }
    } else {
        try {

            if (!req.body.access_token) {
                return res.status(400).send({ error: 'Param `access_token` is missing' });
            }


            let { access_token } = req.body

            page = perPage ?? 1
            perPage = perPage ?? 5

            let url = `${fortnoxApiUrl}/${resources}/` + (id ? id : "")
            url += `?limit=${perPage}&page=${page}`;

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

            let resourcesDataType = capitalizeFirstLetter(resources)

            let totalCount = data[resourcesDataType].count ?? 0;

            let totalResources = data.MetaInformation["@TotalResources"]
            let totalPages = data.MetaInformation["@TotalPages"]
            let currentPage = data.MetaInformation["@CurrentPage"]
            console.log({ data })

            res.set({
                'Access-Control-Expose-Headers': ['Content-Range', 'X-Total-Count'],
                'Access-Control-Allow-Methods': '*',
                'X-Total-Count': totalCount,
                'Content-Range': `${resources}:${currentPage}-${totalPages}/${totalResources}`
            });

            data[resourcesDataType].forEach((dataItem, index) => dataItem.id = index)

            res.status(200).send(data);
        } catch (error) {
            console.log(`An error occurred GET /:resources/:id? :`, error);
            return res.status(500).send(error);
        }
    }
})

module.exports = router;