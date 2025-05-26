// services/Auth/redditAuth.js
const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const tokenUrl = 'https://www.reddit.com/api/v1/access_token';
  const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');

  try {
    const res = await axios.post(tokenUrl, qs.stringify({
      grant_type: 'client_credentials'
    }), {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ZiditScrapeEngine/1.0'
      }
    });

    cachedToken = res.data.access_token;
    tokenExpiry = now + res.data.expires_in * 1000;
    return cachedToken;
  } catch (err) {
    console.error('Error getting Reddit access token:', err.message);
    return null;
  }
}

module.exports = { getAccessToken };
