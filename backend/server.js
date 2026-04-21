require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});


app.get('/api/snippets', async (req, res) => {
  const [rows] = await db.query(
    `SELECT s.*, t.name AS tag
     FROM snippets s
     LEFT JOIN snippet_tags st ON s.id = st.snippet_id
     LEFT JOIN tags t ON st.tag_id = t.id
     ORDER BY s.created_at DESC`
  );

  const snippetMap = {};
  for (const row of rows) {
    if (!snippetMap[row.id]) {
      snippetMap[row.id] = {
        id: row.id,
        title: row.title,
        content: row.content,
        source_url: row.source_url,
        created_at: row.created_at,
        updated_at: row.updated_at,
        tags: []
      };
    }
    if (row.tag) snippetMap[row.id].tags.push(row.tag);
  }

  res.json(Object.values(snippetMap));
});




app.listen(PORT, () => {
  console.log(`SnippetMate backend listening on http://localhost:${PORT}`);
});
