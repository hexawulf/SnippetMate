require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/health', require('./routes/health.js'));
app.use('/api/snippets', auth, require('./routes/snippets.js'));
app.use('/api/fetch-title', auth, require('./routes/fetch-title.js'));
app.use('/api/tags', auth, require('./routes/tags.js'));


// Start the server only when run directly (node server.js) and not when imported by tests.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SnippetMate backend listening on http://localhost:${PORT}`);
  });
}

module.exports = app;