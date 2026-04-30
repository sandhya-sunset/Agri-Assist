module.exports = {
  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY,
    publicKey: process.env.KHALTI_PUBLIC_KEY,
    apiUrl: process.env.KHALTI_API_URL || 'https://a.khalti.com/api/v2',
  },
  frontendUrl: process.env.FRONTEND_URL || 'https://agri-assist-frontend-mq6t.vercel.app/',
  appUrl: process.env.APP_URL || 'https://agri-assist-1-j9z7.onrender.com',
  
};
