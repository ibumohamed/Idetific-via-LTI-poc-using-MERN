import crypto from 'crypto';
import { PUBLIC_KEY } from '../constant.js';

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync("mySuperSecretKey", 'salt', 32); // Store ENCRYPTION_SECRET in .env
const iv = Buffer.alloc(16, 0); // Initialization vector

export const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};


export const generateKidFromPublicKey = () => {
  return crypto
    .createHash("sha256")
    .update(PUBLIC_KEY)
    .digest("hex")
    .slice(0, 20);
}