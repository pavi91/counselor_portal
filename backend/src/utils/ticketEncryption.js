const crypto = require('crypto');
const env = require('../config/env');

const KEY_BYTES = 32;
const IV_BYTES = 12;
const FORMAT_VERSION = 'v1';

let cachedKey = null;

const getKey = () => {
  if (cachedKey) {
    return cachedKey;
  }

  const keyBase64 = env.ticketEncryptionKey;
  if (!keyBase64) {
    throw new Error('Ticket encryption key is not configured');
  }

  const key = Buffer.from(keyBase64, 'base64');
  if (key.length !== KEY_BYTES) {
    throw new Error('Ticket encryption key must be 32 bytes (base64-encoded)');
  }

  cachedKey = key;
  return key;
};

const encryptTicketMessage = (plainText) => {
  if (plainText === null || plainText === undefined) {
    return plainText;
  }

  const text = String(plainText);
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const ivBase64 = iv.toString('base64');
  const cipherBase64 = encrypted.toString('base64');
  const tagBase64 = authTag.toString('base64');

  return `${FORMAT_VERSION}.${ivBase64}.${cipherBase64}.${tagBase64}`;
};

const decryptTicketMessage = (payload) => {
  if (payload === null || payload === undefined) {
    return payload;
  }

  if (typeof payload !== 'string') {
    return payload;
  }

  const parts = payload.split('.');
  if (parts.length !== 4 || parts[0] !== FORMAT_VERSION) {
    return payload;
  }

  const iv = Buffer.from(parts[1], 'base64');
  const ciphertext = Buffer.from(parts[2], 'base64');
  const authTag = Buffer.from(parts[3], 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
};

module.exports = {
  encryptTicketMessage,
  decryptTicketMessage
};
