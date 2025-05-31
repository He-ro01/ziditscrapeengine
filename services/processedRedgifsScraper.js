require('dotenv').config();
const { createConnection } = require('mongoose');
const puppeteer = require('puppeteer');
const createProcessedModel = require('../models/ProcessedRedGifs');

function getRoughSizeOfObject(obj) {
  const json = JSON.stringify(obj);
  const bytes = Buffer.byteLength(json, 'utf8');
  const kb = (bytes / 1024).toFixed(2);
  const mb = (bytes / 1024 / 1024).toFixed(2);
  return { bytes, kb, mb };
}

const MONGO_URI_PROCESSED_VIDS = "mongodb+srv://ziditstudios:jE8WvcrM8WZfwcFZ@hero.povfhja.mongodb.net/";

const processedMongoose = createConnection(MONGO_URI_PROCESSED_VIDS, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

processedMongoose.on('connected', () =>
  console.log('📡 Connected to Processed Vids DB')
);

processedMongoose.once('error', (err) =>
  console.error('❌ Processed DB connection error:', err)
);

const Processed = createProcessedModel(processedMongoose);

async function scrapeRedgifsData(url) {
  // ✅ Skip if already processed
  const exists = await Processed.findOne({ rawUrl: url });
  if (exists) {
    console.log(`⏩ Skipping already processed: ${url}`);
    return null;
  }
  console.log(`command recieved: ${url}`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 600000 });
    await page.waitForSelector('.previewFeed', { timeout: 150000 });

    const html = await page.content();
    const preview = await page.$('.previewFeed');
    if (!preview) throw new Error('No .previewFeed found after waiting');

    const data = {};

    data.tags = await preview.$$eval('.tagList a.tag', links =>
      links.map(link => link.getAttribute('href')?.split('/').pop()).filter(Boolean)
    );

    data.date = await preview.$eval('.UserInfo-Date', el =>
      el.getAttribute('href')?.split('/').pop()
    ).catch(() => null);

    data.username = await preview.$eval('.UserInfo-UserLink', el =>
      el.getAttribute('href')?.split('/').pop()
    ).catch(() => null);

    data.description = await preview.$eval('.descriptionText', el =>
      el.textContent?.trim()
    ).catch(() => null);

    data.views = await preview.$eval('button.views', el =>
      el.getAttribute('aria-label')?.replace(/\D/g, '')
    ).catch(() => null);

    data.likes = await preview.$eval('button[aria-label="toggle like button"] .label', el =>
      el.textContent?.trim()
    ).catch(() => null);

    data.imageUrl = await preview.$eval('.UserInfo-ImageWrap img', el =>
      el.getAttribute('src')
    ).catch(() => null);

    const rawMatch = html.match(/https:\/\/media\.redgifs\.com\/([\w-]+)-silent\.mp4/);
    data.videoUrl = rawMatch
      ? `https://media.redgifs.com/${rawMatch[1]}-mobile.m4s`
      : null;

    data.rawUrl = url;

    const sizeInfo = getRoughSizeOfObject(data);
    console.log(`\n📦 Scraped Data Preview for ${url}`);
    console.log(JSON.stringify(data, null, 2));
    console.log(`\n📐 Estimated Object Size:`);
    console.log(`• Bytes: ${sizeInfo.bytes}`);
    console.log(`• KB   : ${sizeInfo.kb} KB`);
    console.log(`• MB   : ${sizeInfo.mb} MB\n`);

    await Processed.create(data);
    console.log(`✅ Scraped and saved: ${url}`);
    return data;

  } catch (err) {
    console.error(`❌ Failed to scrape ${url}: ${err.message}`);
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeRedgifsData };
