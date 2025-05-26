const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const fs = require('fs');

(async () => {
  const URL = 'https://www.tiktok.com/@accountpermanentlyband/video/7507353922311376150?is_from_webapp=1&sender_device=pc'; // Replace with your target URL

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--start-fullscreen'
    ]
  });

  const [page] = await browser.pages();
  await page.goto(URL, { waitUntil: 'networkidle2' });

  // Wait for video element
  await page.waitForSelector('video');

  // Play video if not autoplayed
  await page.evaluate(() => {
    const vid = document.querySelector('video');
    if (vid && vid.paused) vid.play();
  });

  // Get video element position and size
  const clip = await page.evaluate(() => {
    const rect = document.querySelector('video').getBoundingClientRect();
    return {
      x: Math.floor(rect.left),
      y: Math.floor(rect.top),
      width: Math.floor(rect.width),
      height: Math.floor(rect.height)
    };
  });

  console.log('🎥 Video clip bounds:', clip);

  // Prepare FFmpeg command
  const ffmpegArgs = [
    '-y',
    '-f', 'gdigrab', // Windows screen capture
    '-framerate', '30',
    '-offset_x', clip.x.toString(),
    '-offset_y', clip.y.toString(),
    '-video_size', `${clip.width}x${clip.height}`,
    '-i', 'desktop',
    '-f', 'dshow', // Audio capture (Windows)
    '-i', 'audio=CABLE Output (VB-Audio Virtual Cable)', // Change if needed
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-c:a', 'aac',
    '-pix_fmt', 'yuv420p',
    'output.mp4'
  ];

  console.log('▶️ Starting FFmpeg...');
  const ffmpeg = spawn('ffmpeg', ffmpegArgs);

  ffmpeg.stderr.on('data', data => process.stderr.write(data));
  ffmpeg.stdout.on('data', data => process.stdout.write(data));

  // Record for N seconds
  const RECORD_SECONDS = 20;
  setTimeout(() => {
    ffmpeg.kill('SIGINT');
    browser.close();
    console.log('✅ Done recording.');
  }, RECORD_SECONDS * 10000);
})();
