import { test } from 'node:test'
import assert from 'node:assert'
import { isHttpUrl, parseTagInput, apiErrorMessage } from './safety.js'

test('isHttpUrl accepts only http and https', () => {
  for (const ok of ['https://example.com', 'http://example.com/a?b=c', ' https://example.com ']) {
    assert.strictEqual(isHttpUrl(ok), true, ok)
  }
  for (const bad of ['javascript:alert(1)', 'JAVASCRIPT:alert(1)', ' javascript:alert(1)', 'data:text/html,x',
    'vbscript:x', 'file:///etc/passwd', 'example.com', '//example.com', '', null, undefined, 42]) {
    assert.strictEqual(isHttpUrl(bad), false, String(bad))
  }
})

test('parseTagInput trims and de-duplicates without regard to case', () => {
  assert.deepStrictEqual(parseTagInput('js, JS , go,, js ,Go'), ['js', 'go'])
  assert.deepStrictEqual(parseTagInput(''), [])
  assert.deepStrictEqual(parseTagInput(undefined), [])
})

test('apiErrorMessage prefers the server message', () => {
  assert.strictEqual(apiErrorMessage({ response: { status: 400, data: { error: 'content is required' } } }, 'x'), 'content is required')
  assert.strictEqual(apiErrorMessage({ response: { status: 413, data: '<html>' } }, 'x'), 'That is too large to send.')
  assert.strictEqual(apiErrorMessage({ response: { status: 500, data: {} } }, 'Could not save'), 'Could not save')
  assert.match(apiErrorMessage(new Error('Network Error'), 'x'), /reach the server/)
})
