const express = require('express');
const router = express.Router();
const Username = require('../models/username');
const Image = require('../models/Image');
const RawVideo = require('../models/RawVideo');
const RedgifsRaw = require('../models/RedgifsRaw'); // ← NEW
const { scrapeUserMedia } = require('../services/redditScraper');

router.post('/scrape-all', async (req, res) => {
  try {
    const usernames = await Username.find();

    let imageCount = 0;
    let videoCount = 0;
    let redgifsCount = 0;

    for (const { username } of usernames) {
      const { images, rawVideos } = await scrapeUserMedia(username);

      const redgifs = rawVideos.filter(post => post.url && post.url.includes('redgifs'));
      const normalVideos = rawVideos.filter(post => !post.url || !post.url.includes('redgifs'));

      if (images.length > 0) {
        await Image.insertMany(images, { ordered: false }).catch(() => {});
        imageCount += images.length;
      }

      if (normalVideos.length > 0) {
        await RawVideo.insertMany(normalVideos, { ordered: false }).catch(() => {});
        videoCount += normalVideos.length;
      }

      if (redgifs.length > 0) {
        await RedgifsRaw.insertMany(redgifs, { ordered: false }).catch(() => {});
        redgifsCount += redgifs.length;
      }

      console.log(`Scraped ${username} – Images: ${images.length}, Videos: ${normalVideos.length}, Redgifs: ${redgifs.length}`);
    }

    res.json({
      message: 'Scraping complete',
      images: imageCount,
      videos: videoCount,
      redgifs: redgifsCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

module.exports = router;
