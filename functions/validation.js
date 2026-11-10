import { createHash } from 'node:crypto';

export function conversationId(a, b) {
  return createHash('sha256').update(JSON.stringify([a, b].sort())).digest('hex');
}

export function validText(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 4000;
}

export function decodeImage(value) {
  if (typeof value !== 'string' || value.length > 7_000_000 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new Error('Imagem inválida.');
  }
  const bytes = Buffer.from(value, 'base64');
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error('A imagem deve ter até 5 MB.');
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return { bytes, type: 'image/jpeg' };
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { bytes, type: 'image/png' };
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') return { bytes, type: 'image/webp' };
  throw new Error('Use uma imagem JPEG, PNG ou WebP.');
}
