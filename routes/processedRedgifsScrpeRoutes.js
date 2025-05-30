const express = require('express');
const router = express.Router();
const RedgifsRaw = require('../models/RedgifsRaw');
const { scrapeRedgifsData } = require('../services/processedRedgifsScraper');



router.post('/scrape-redgifs', async (req, res) => {
  try {
    console.log(`counting items`);
    const raws = await RedgifsRaw.find(); // Fetch all raw redgifs links
    let processedCount = 0;
    const total = raws.length;

    console.log(`Starting Redgifs scraping: ${total} items`);

    for (let i = 0; i < total; i++) {
      const { url } = raws[i];
      console.log(`[${i + 1}/${total}] Scraping: ${url}`);

      try {
        const result = await scrapeRedgifsData(url);
        if (result) {
          processedCount++;
          console.log(`[${i + 1}/${total}] ✅ Success`);
        } else {
          console.log(`[${i + 1}/${total}] ⚠️ Skipped or invalid`);
        }
      } catch (err) {
        console.warn(`[${i + 1}/${total}] ❌ Failed: ${url} - ${err.message}`);
      }
    }

    console.log(`Finished scraping. Processed ${processedCount} of ${total}.`);

    res.json({
      message: `Redgifs scraping complete.`,
      processed: processedCount,
      total
    });
  } catch (err) {
    console.error('Scraping error:', err.message);
    res.status(500).json({ error: 'Failed to scrape redgifs data' });
  }
});

module.exports = router;
