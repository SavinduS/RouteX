const axios = require('axios');

const getLkrToUsdRate = async () => {
    try {
        const apiKey = process.env.EXCHANGE_RATE_API_KEY;
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/LKR/USD`);
        return response.data.conversion_rate;
    } catch (error) {
        console.error("Exchange Rate API Error:", error.message);
        return 0.0033; 
    }
};

module.exports = { getLkrToUsdRate };