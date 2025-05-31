const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { scrapeRedgifsData } = require('../services/processedRedgifsScraper');

router.post('/scrape-redgifs', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'test.redgifsraws.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const raws = JSON.parse(rawData);
    const total = raws.length;

    res.json({ message: 'File read. Background process started.' });

    let processedCount = 0;

    for (let i = 0; i < total; i++) {
      const rawItem = raws[i];

      const candidates = [rawItem.url, rawItem.selftext, rawItem.title];
      const redgifsUrl = candidates
        .filter(Boolean)
        .map(v => {
          const match = v.match(/https?:\/\/(?:www\.)?redgifs\.com\/watch\/[\w-]+/);
          return match ? match[0] : null;
        })
        .find(Boolean);

      if (!redgifsUrl) {
        console.log(`[${i + 1}/${total}] ⛔ No Redgifs URL found`);
        continue;
      }

      console.log(`[${i + 1}/${total}] 🌐 Scraping: ${redgifsUrl}`);

      try {
        const result = await scrapeRedgifsData(redgifsUrl);

        if (result) {
          const document = {
            ...result,
            rawUrl: redgifsUrl,
            scrapedAt: new Date(),
          };

          // Replace this with a file-write or log if needed
          console.log(`[${i + 1}/${total}] ✅ Scraped`, document);
          processedCount++;
        } else {
          console.log(`[${i + 1}/${total}] ⚠️ No result returned`);
        }
      } catch (err) {
        console.warn(`[${i + 1}/${total}] ❌ Error scraping ${redgifsUrl}: ${err.message}`);
      }
    }

    console.log(`✅ Done. Processed ${processedCount} of ${total}`);
  } catch (err) {
    console.error('🛑 Top-level error:', err.message);
    res.status(500).json({ error: 'Failed to read file or scrape Redgifs data' });
  }
});

module.exports = router;
