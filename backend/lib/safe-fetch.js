'use strict';

// Fetch the <title> of a user-supplied URL without letting the request reach
// anything that is not on the public internet (SSRF protection).
//
// - only http/https on the default ports, no credentials in the URL
// - the address the socket actually connects to is checked inside the DNS
//   lookup, so a name that resolves to a private address (or changes between
//   check and connect) is refused
// - redirects are followed by hand, each hop checked the same way
// - one deadline for the whole operation and a cap on bytes read

const http = require('node:http');
const https = require('node:https');
const dns = require('node:dns');
const net = require('node:net');

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 5000;
const MAX_BYTES = 256 * 1024;
const USER_AGENT = 'Mozilla/5.0 (compatible; SnippetMate/1.0)';

const blocked = new net.BlockList();
[
  ['0.0.0.0', 8],        // "this" network
  ['10.0.0.0', 8],       // private
  ['100.64.0.0', 10],    // carrier-grade NAT
  ['127.0.0.0', 8],      // loopback
  ['169.254.0.0', 16],   // link-local, cloud metadata
  ['172.16.0.0', 12],    // private
  ['192.0.0.0', 24],     // IETF protocol assignments
  ['192.0.2.0', 24],     // documentation
  ['192.168.0.0', 16],   // private
  ['198.18.0.0', 15],    // benchmarking
  ['198.51.100.0', 24],  // documentation
  ['203.0.113.0', 24],   // documentation
  ['224.0.0.0', 4],      // multicast
  ['240.0.0.0', 4],      // reserved, broadcast
].forEach(([addr, prefix]) => blocked.addSubnet(addr, prefix, 'ipv4'));
[
  ['::', 127],           // unspecified and loopback
  ['64:ff9b::', 96],     // NAT64
  ['100::', 64],         // discard
  ['2001:db8::', 32],    // documentation
  ['fc00::', 7],         // unique local
  ['fe80::', 10],        // link-local
  ['ff00::', 8],         // multicast
].forEach(([addr, prefix]) => blocked.addSubnet(addr, prefix, 'ipv6'));

class BlockedUrlError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BlockedUrlError';
  }
}

/** True when the address is not a public unicast address. */
function isBlockedAddress(address) {
  const family = net.isIP(address);
  if (family === 4) return blocked.check(address, 'ipv4');
  // IPv4-mapped IPv6 (::ffff:a.b.c.d) is matched against the IPv4 rules.
  if (family === 6) return blocked.check(address, 'ipv6');
  return true; // not an IP address at all
}

/** Parse and check the URL itself. Throws BlockedUrlError. */
function parseAllowedUrl(raw) {
  if (typeof raw !== 'string' || raw.length > 2048) {
    throw new BlockedUrlError('URL must be a string of at most 2048 characters');
  }
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new BlockedUrlError('Not a valid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BlockedUrlError('Only http and https URLs are allowed');
  }
  if (url.username || url.password) {
    throw new BlockedUrlError('URLs with credentials are not allowed');
  }
  if (url.port !== '') {
    throw new BlockedUrlError('Only the default ports are allowed');
  }
  // URL.hostname keeps the brackets around IPv6 literals.
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) && isBlockedAddress(host)) {
    throw new BlockedUrlError('Address is not allowed');
  }
  return url;
}

/** dns.lookup replacement that refuses private results. */
function guardedLookup(hostname, options, callback) {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) return callback(err);
    const list = Array.isArray(address) ? address : [{ address, family }];
    if (list.length === 0 || list.some((a) => isBlockedAddress(a.address))) {
      return callback(new BlockedUrlError('Address is not allowed'));
    }
    callback(null, address, family);
  });
}

function requestOnce(url, { allowPrivate, signal }) {
  return new Promise((resolve, reject) => {
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.get(
      url,
      {
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
        lookup: allowPrivate ? undefined : guardedLookup,
        signal,
      },
      (res) => {
        const status = res.statusCode || 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          return resolve({ redirect: res.headers.location });
        }
        const chunks = [];
        let size = 0;
        res.on('data', (chunk) => {
          size += chunk.length;
          chunks.push(chunk);
          if (size >= MAX_BYTES) {
            // Enough to find a <title>; stop reading.
            res.destroy();
            resolve({ body: Buffer.concat(chunks).subarray(0, MAX_BYTES).toString('utf8') });
          }
        });
        res.on('end', () => resolve({ body: Buffer.concat(chunks).toString('utf8') }));
        res.on('error', reject);
      }
    );
    req.on('error', reject);
  });
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().slice(0, 300) : '';
}

/**
 * Fetch the page title of a public URL.
 * `options.allowPrivate` and `options.allowPorts` exist for tests against a
 * local server and must never be set from request input.
 */
async function fetchTitle(rawUrl, options = {}) {
  const { allowPrivate = false, allowPorts = false, timeoutMs = TIMEOUT_MS } = options;
  const check = (value) => {
    if (!allowPrivate && !allowPorts) return parseAllowedUrl(value);
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new BlockedUrlError('Only http and https URLs are allowed');
    }
    return url;
  };

  const signal = AbortSignal.timeout(timeoutMs);
  let url = check(rawUrl);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const result = await requestOnce(url, { allowPrivate, signal });
    if (result.redirect === undefined) return extractTitle(result.body);
    let next;
    try {
      next = new URL(result.redirect, url).toString();
    } catch {
      throw new BlockedUrlError('Invalid redirect');
    }
    url = check(next);
  }
  throw new Error('Too many redirects');
}

module.exports = {
  fetchTitle,
  parseAllowedUrl,
  isBlockedAddress,
  guardedLookup,
  extractTitle,
  BlockedUrlError,
  MAX_BYTES,
};
