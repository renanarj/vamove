import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { conversationId, decodeImage, validText } from '../functions/validation.js';

test('conversation IDs are stable and cannot collide by concatenation', () => {
  assert.equal(conversationId('alice', 'bob'), conversationId('bob', 'alice'));
  assert.notEqual(conversationId('ab', 'c'), conversationId('a', 'bc'));
});

test('text requires content and enforces the limit', () => {
  assert.equal(validText(' Olá 😀 '), true);
  assert.equal(validText('   '), false);
  assert.equal(validText('x'.repeat(4001)), false);
  assert.equal(validText(null), false);
});

test('image validation accepts supported signatures and rejects invalid input', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(decodeImage(png.toString('base64')).type, 'image/png');
  assert.equal(decodeImage(Buffer.from([0xff, 0xd8, 0xff]).toString('base64')).type, 'image/jpeg');
  assert.equal(decodeImage(Buffer.from('RIFF0000WEBP').toString('base64')).type, 'image/webp');
  assert.throws(() => decodeImage('not base64!'));
  assert.throws(() => decodeImage(Buffer.from('<svg></svg>').toString('base64')));
  assert.throws(() => decodeImage(Buffer.alloc(5 * 1024 * 1024 + 1).toString('base64')));
});
