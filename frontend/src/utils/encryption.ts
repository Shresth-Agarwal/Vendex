import CryptoJS from 'crypto-js';

// In production, this key should be stored securely and retrieved from the backend
// For now, using a simple key derivation from user ID
const getEncryptionKey = (userId: number): string => {
  // In production, this should be fetched from backend or derived securely
  return `vendex_chat_key_${userId}`;
};

export const encryptMessage = (message: string, userId: number): string => {
  const key = getEncryptionKey(userId);
  return CryptoJS.AES.encrypt(message, key).toString();
};

export const decryptMessage = (encryptedMessage: string, userId: number): string => {
  try {
    const key = getEncryptionKey(userId);
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Unable to decrypt message]';
  }
};
