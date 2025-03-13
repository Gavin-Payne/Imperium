const express = require('express');
const fetch = require('node-fetch'); // or use native fetch in Node 18+
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600 }); // cache for 1 hour

const router = express.Router();
const API_NINJAS_URL = "https://api.api-ninjas.com/v1/commodityprice?name=soybean_meal";

router.get('/soybean_data', async (req, res) => {
    try {
        const cachedData = cache.get('soybeanData');
        if (cachedData) {
            return res.json(cachedData);
        }

        // Fetch from the third-party API if cache is empty
        const response = await fetch(API_NINJAS_URL, {
            headers: { "X-Api-Key": process.env.API_NINJAS_API_KEY }
        });
        if (!response.ok) {
            return res.status(response.status).json({ error: 'API request failed' });
        }
        const result = await response.json();
        if (!result.updated || !result.price) {
            return res.status(500).json({ error: 'Invalid API response' });
        }
        const newEntry = {
            price: result.price,
            updated: new Date(result.updated * 1000).toLocaleTimeString(),
        };

        // Save result in cache
        cache.set('soybeanData', newEntry);
        return res.json(newEntry);
    } catch (error) {
        console.error("Error fetching soybean data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;