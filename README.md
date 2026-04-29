# <img src="frontend/public/favicon.svg" alt="SnippetMate icon" width="32"> SnippetMate

**Paste it. Tag it. And then Find it.**

SnippetMate is a single-page web application (SPA) for capturing short text or code snippets from the web, including AI prompts and AI responses. You can tag your snippets, then search by title, tag, or even by full-text.

Your "SnippetMate" lives in your browser while you're reading the news, browsing the web, or working on coding sites and documentation sites like MDN or SourceForge.


![SnippetMate desktop view](docs/snippetmate_screenshot.png)

## Tech Stack

- **Frontend:** Vue 3 + Vite + Bootstrap 5 (with the Bootswatch "United" theme) + SweetAlert2 (Pop-Ups)
- **Backend:** Node.js + Express
- **Database:** MySQL 8 (FULLTEXT index on title and content, and a many-to-many snippet–tag schema)

No external APIs are used in this project.

## Dynamic Aspects

The two required dynamic aspects (front-end JavaScript talking to the back-end) in the SnippetMate project are:

1. **"CRUD" with search and tag filtering** — Create, Read, Update and Delete snippets. With full-text search across the title,  the content and also a tag-based sidebar filter.
2. **Server-side URL title fetching** — You paste a source URL, then (optionally) click the button *Fetch title*, and the back-end retrieves the page title and fills it into the form.

## Project Layout

```
SnippetMate/
├── backend/        Node.js + Express API
│   ├── routes/     /api/health, /api/snippets, /api/tags, /api/fetch-title
│   ├── test/       Integration tests using node:test + supertest
│   ├── db.js       MySQL connection pool
│   ├── server.js   Express entry point
│   └── .env.example
├── db/
│   ├── schema.sql  Table definitions (snippets, tags, snippet_tags)
│   └── seed.sql    Optional sample data (16 snippets, 21 tags)
└── frontend/       Vue 3 + Vite single-page app
    └── src/
        ├── components/   NavBar, SearchBar, TagSidebar, SnippetList,
        │                 SnippetCard, SnippetFormModal
        ├── services/     api.js (axios wrapper)
        ├── App.vue
        └── main.js
```

## Requirements

- Node.js 20 or newer
- MySQL 8 or newer
- Git

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/hexawulf/SnippetMate.git
cd SnippetMate
```

### 2. Set up the database

Log into MySQL as an admin user (root user) that can create databases and users:

```bash
sudo mysql
```

Then run the following SQL command to create the database and a dedicated App user, for example "snippetmate_user":

```sql
CREATE DATABASE snippetmate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'snippetmate_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON snippetmate.* TO 'snippetmate_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Here, please replace `your_password_here` with a secure password of your choice. You will then use this password and put it inside the `.env` file in the next step.

Now load the schema, and you can also optionally use the sample data provided in seed.sql:

```bash
mysql -u snippetmate_user -p snippetmate < db/schema.sql
mysql -u snippetmate_user -p snippetmate < db/seed.sql
```

### 3. Configure the backend environment

```bash
cd backend
cp .env.example .env
```

Open `.env` and set `DB_PASSWORD` to the password you chose earlier in step 2. The other variables can all stay at their original default values.

### 4. Install backend dependencies and start the server

```bash
npm install
npm start
```

The backend will start on `http://localhost:3000`.

### 5. Install frontend dependencies and then go on and  start the dev server

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will start on `http://localhost:5173`. Open that URL in your browser.

## Running the Tests

The Backend has integration tests covering the health check, tag listing, tag filtering, and the full snippet CRUD lifecycle.

```bash
cd backend
npm test
```

Tests run against the same MySQL database configured in `.env` and clean up after themselves.

## Course Information

Course: DLBCSPJWD01 — Project Java and Web Development
IU International University of Applied Sciences

## Author

Erling Wulf Weinreich
B.Sc. Computer Science, IU International University of Applied Sciences
erling-wulf.weinreich@iu-study.org

## License

This project is licensed under the [MIT License](LICENSE).