// services/redditScraper.js


const axios = require('axios');
const { getAccessToken } = require('../auth/redditAuth');


async function scrapeUserMedia(username) {
  const images = [];
  const rawVideos = [];
  let after = null;

  const token = await getAccessToken();
  if (!token) {
    console.error('No Reddit token available.');
    return { images, rawVideos };
  }

  try {
    do {
      const url = `https://oauth.reddit.com/user/${username}/submitted?limit=100${after ? `&after=${after}` : ''}`;

      const res = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'ZiditScrapeEngine/1.0'
        }
      });

      const posts = res.data.data.children;
      after = res.data.data.after;

      posts.forEach(post => {
        const data = post.data;

        if (!data.url || data.is_self) return;

        const mediaUrl = data.url.toLowerCase();
        const isImage = /\.(jpg|jpeg|png|gif)/.test(mediaUrl);
        const isGif = mediaUrl.includes('.gifv') || mediaUrl.includes('gfycat.com') || mediaUrl.includes('redgifs.com');
        const isRedditVideo = data.is_video || mediaUrl.includes('v.redd.it');

        if (isImage) {
          images.push(data);  // 🔥 Push raw data object
        } else if (isGif || isRedditVideo) {
          rawVideos.push(data);  // 🔥 Push raw data object
        }
      });
    } while (after);

    return { images, rawVideos };
  } catch (err) {
    console.error(`Error scraping ${username}:`, err.message);
    return { images: [], rawVideos: [] };
  }
}

module.exports = { scrapeUserMedia };
