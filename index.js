const { Client, Environment } = require('square')
const { v4: uuidv4 } = require("uuid")
const axios = require('axios').default
require('dotenv').config()
const client = new Client({
    environment: Environment.Sandbox,
    accessToken: process.env.ACCESS_TOKEN
})
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('/error', (req, res) => {
    res.sendFile(__dirname + '/error.html')
})

app.get('/confirm', (req, res) => {
    res.sendFile(__dirname + '/confirm.html')
})

app.post('/checkout-api', async (req, res) => {
    try {
        const response = await axios.post(`https://connect.squareupsandbox.com/v2/locations/${process.env.LOCATION_ID}/checkouts`,{
            order: {
              order: {
                location_id: process.env.LOCATION_ID,
                line_items: req.body.line_items
              },
              idempotency_key: uuidv4()
            },
            idempotency_key: uuidv4(),
            redirect_url: `${process.env.NGROK_URL}/confirm`
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Square-Version': '2022-06-16'
            }
        })
        const { checkout_page_url } = response.data.checkout
        res.status(200).json({checkoutPageUrl: checkout_page_url})
    } catch(error) {
        res.status(500).json({ error })
        console.log(error)
    }
})

app.post('/checkout-np', async (req, res) => {
    try {
        const response = await client.checkoutApi.createCheckout(process.env.LOCATION_ID,
        {
          idempotencyKey: uuidv4(),
          order: {
            order: {
              locationId: process.env.LOCATION_ID,
              lineItems: req.body.line_items
            },
            idempotencyKey: uuidv4()
          },
          redirectUrl: `${process.env.NGROK_URL}/confirm`
        })
        const { checkoutPageUrl } = response.result.checkout
        res.status(200).json({checkoutPageUrl})
    } catch(error) {
        res.status(500).json({ error })
        console.log(error)
    }
})


app.listen(3000, console.log('Server started on port 3000'))