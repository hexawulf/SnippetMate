require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth.js');
const { ValidationError } = require('./lib/validate.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// An export of 1000 snippets is well over the 100 KB default; imports of
// one's own export used to fail with 413.
app.use(express.json({ limit: '5mb' }));

app.use('/api/health', require('./routes/health.js'));
app.use('/api/snippets', auth, require('./routes/snippets.js'));
app.use('/api/fetch-title', auth, require('./routes/fetch-title.js'));
app.use('/api/tags', auth, require('./routes/tags.js'));

// Unknown API paths answer in JSON like everything else.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// One place that turns errors into JSON responses.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'File too large (the limit is 5 MB)' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  console.error('[error]', req.method, req.path, err?.code, err?.message);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Start the server only when run directly (node server.js) and not when imported by tests.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SnippetMate backend listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
