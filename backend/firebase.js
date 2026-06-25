'use strict';
const { initializeApp, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

if (!getApps().length) {
  initializeApp();
}

// Export an object with auth() to match the call site in auth.js middleware.
module.exports = { auth: () => getAuth() };
