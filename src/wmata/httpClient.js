const axios = require("axios");

const {
  WMATA_API_KEY,
  WMATA_BASE_URL = "https://api.wmata.com/"
} = process.env;

const createClient = ({ apiKey = WMATA_API_KEY, baseURL = WMATA_BASE_URL }) =>
  axios.create({
    baseURL,
    timeout: 2000,
    headers: { api_key: apiKey }
  });

module.exports = createClient;
