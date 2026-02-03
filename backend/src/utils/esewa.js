const crypto = require('crypto');

const createSignature = (message) => {
  const secret = '8gBm/:&EnhH.1/q'; // UAT Secret Key
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('base64');
};

module.exports = { createSignature };
