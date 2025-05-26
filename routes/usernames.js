const express = require('express');
const router = express.Router();
const Username = require('../models/username');

router.post('/add-usernames', async (req, res) => {
  try {
    const rawText = req.body.text || '';
    const cleanedList = rawText
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(name => name.trim().replace(/^u\//, ''));

    const docs = cleanedList.map(name => ({ username: name }));

    const result = await Username.insertMany(docs, { ordered: false });
    res.status(201).json({ inserted: result.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Some usernames might already exist or another error occurred.' });
  }
});

module.exports = router;
