const express = require('express');
const router = express.Router();
const { fetchTitle, BlockedUrlError } = require('../lib/safe-fetch.js');

// Fetch the <title> of a URL on the server side, so the browser doesn't hit CORS issues.
// The URL comes from the user, so lib/safe-fetch.js only lets it reach public
// http/https hosts (no loopback, LAN or other internal addresses).
router.post('/', async (req, res) => {
  const url = req.body?.url;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const title = await fetchTitle(url);
    res.json({ title });
  } catch (err) {
    if (err instanceof BlockedUrlError) {
      return res.status(400).json({ error: 'URL not allowed' });
    }
    res.status(502).json({ error: 'Could not fetch URL' });
  }
});

module.exports = router;
