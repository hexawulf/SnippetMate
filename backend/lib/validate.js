'use strict';

// Input validation for snippets. Everything that reaches SQL goes through here,
// so the routes never see undefined fields, non-array tags or odd URLs.

const MAX_TITLE = 500;        // snippets.title VARCHAR(500)
const MAX_CONTENT = 60000;    // snippets.content TEXT (65,535 bytes; leave room for multi-byte text)
const MAX_URL = 2083;         // snippets.source_url VARCHAR(2083)
const MAX_TAG = 100;          // tags.name VARCHAR(100)
const MAX_TAGS = 50;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

/**
 * Trim, drop empties and remove duplicates. Tag names are unique in the
 * database under a case-insensitive collation, so "js" and "JS" are one tag.
 */
function normalizeTags(input) {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) throw new ValidationError('tags must be a list');
  const seen = new Set();
  const tags = [];
  for (const raw of input) {
    if (typeof raw !== 'string') throw new ValidationError('tags must be text');
    const name = raw.trim();
    if (!name) continue;
    if (name.length > MAX_TAG) throw new ValidationError(`A tag can be at most ${MAX_TAG} characters`);
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(name);
  }
  if (tags.length > MAX_TAGS) throw new ValidationError(`At most ${MAX_TAGS} tags per snippet`);
  return tags;
}

/**
 * The source URL is rendered as a link, so only http and https are accepted
 * (a `javascript:` URL would run in the page when clicked).
 */
function normalizeSourceUrl(input) {
  if (input === undefined || input === null) return null;
  if (typeof input !== 'string') throw new ValidationError('source_url must be text');
  const value = input.trim();
  if (!value) return null;
  if (value.length > MAX_URL) throw new ValidationError(`source_url can be at most ${MAX_URL} characters`);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ValidationError('source_url is not a valid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ValidationError('source_url must start with http:// or https://');
  }
  return value;
}

/** Validate a snippet body from the form or an import row. */
function parseSnippet(body, { requireTitle = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('Snippet must be an object');
  }

  let title = null;
  if (body.title !== undefined && body.title !== null) {
    if (typeof body.title !== 'string') throw new ValidationError('title must be text');
    title = body.title.trim() || null;
    if (title && title.length > MAX_TITLE) throw new ValidationError(`title can be at most ${MAX_TITLE} characters`);
  }
  if (requireTitle && !title) throw new ValidationError('Missing required fields: title and content');

  if (typeof body.content !== 'string' || body.content.trim() === '') {
    throw new ValidationError(requireTitle ? 'Missing required fields: title and content' : 'content is required');
  }
  if (body.content.length > MAX_CONTENT) {
    throw new ValidationError(`content can be at most ${MAX_CONTENT} characters`);
  }

  return {
    title,
    content: body.content,
    source_url: normalizeSourceUrl(body.source_url),
    tags: normalizeTags(body.tags),
  };
}

/** A positive integer id from a URL parameter, or null. */
function parseId(raw) {
  return typeof raw === 'string' && /^[1-9][0-9]{0,9}$/.test(raw) && Number(raw) <= 2147483647 ? Number(raw) : null;
}

/** Words of a search box entry, at most eight, with LIKE wildcards escaped. */
function searchTerms(q) {
  if (typeof q !== 'string') return [];
  return q
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .map((term) => term.slice(0, 100).replace(/[\\%_]/g, '\\$&'));
}

module.exports = {
  ValidationError,
  normalizeTags,
  normalizeSourceUrl,
  parseSnippet,
  parseId,
  searchTerms,
  MAX_TITLE,
  MAX_CONTENT,
  MAX_TAG,
  MAX_TAGS,
};
