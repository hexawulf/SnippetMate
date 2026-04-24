-- SnippetMate schema.sql (MySQL 8.4)
-- Run this against the  existing snippetmate database:
--   mysql -u snippetmate_user -p snippetmate < db/schema.sql
-- Password for snippetmate database is in the README.md file

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS snippets (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(500) DEFAULT NULL,
  content TEXT NOT NULL,
  source_url VARCHAR(2083) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FULLTEXT KEY ft_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tags (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tag_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS snippet_tags (
  snippet_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (snippet_id, tag_id),
  KEY idx_tag_id (tag_id),
  CONSTRAINT fk_snippet_tags_snippet FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE,
  CONSTRAINT fk_snippet_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
