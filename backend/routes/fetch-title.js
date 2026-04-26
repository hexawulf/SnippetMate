const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SnippetMate/1.0)' }
    });
    const html = await response.text();
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = match ? match[1].replace(/&amp;/g, '&').trim() : '';
    res.json({ title });
  } catch (err) {
    res.status(502).json({ error: 'Could not fetch URL' });
  }
});

module.exports = router;