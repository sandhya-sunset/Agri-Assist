module.exports = {
  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY,
    apiUrl: process.env.KHALTI_API_URL || 'https://dev.khalti.com/api/v2',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
};