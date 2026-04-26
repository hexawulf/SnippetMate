require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/health', require('./routes/health.js'));
app.use('/api/snippets', require('./routes/snippets.js'));

app.listen(PORT, () => {
  console.log(`SnippetMate backend listening on http://localhost:${PORT}`);
});