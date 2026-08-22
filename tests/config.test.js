'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalisePublicUrl } = require('../src/config');

test('the public address is normalised however it arrives', () => {
  // Render's blueprint supplies a bare hostname.
  assert.equal(normalisePublicUrl('instrument-platform.onrender.com'),
    'https://instrument-platform.onrender.com');
  // A hand-typed value often carries a trailing slash.
  assert.equal(normalisePublicUrl('https://example.com/'), 'https://example.com');
  assert.equal(normalisePublicUrl('  https://example.com//  '), 'https://example.com');
  // Local work stays on http.
  assert.equal(normalisePublicUrl('http://127.0.0.1:3000'), 'http://127.0.0.1:3000');
  // Unset stays unset: the admin page then says so instead of drawing a QR
  // code that leads nowhere.
  assert.equal(normalisePublicUrl(''), '');
  assert.equal(normalisePublicUrl(undefined), '');
});
