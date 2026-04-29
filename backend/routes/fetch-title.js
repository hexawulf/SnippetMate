const express = require('express');
const router = express.Router();


// Fetch the <title> of a URL on the server side - without sending the request to the external URL, so the browser doesn't hit CORS issues.
router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const response = await fetch(url, {
       // Some sites block requests without a User-Agent, so we use a "normal-looking" browser User-Agent.
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SnippetMate/1.0)' }
    });
    const html = await response.text();
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = match ? match[1].replace(/&amp;/g, '&').trim() : '';
    res.json({ title });
  } catch {
    res.status(502).json({ error: 'Could not fetch URL' });
  }
});

module.exports = router;