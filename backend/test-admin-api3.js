const axios = require('axios');

async function run() {
  try {
    console.log('Starting login...');
    const resAuth = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sandhyamajhi77@gmail.com',
      password: 'admin123'
    });
    console.log('Login succes:', resAuth.data.success);
    const token = resAuth.data.data.token;
    
    console.log('Starting update...');
    const resUpdate = await axios.put('http://localhost:5000/api/auth/update-password', {
      currentPassword: 'admin123',
      newPassword: 'admin1234!!'
    }, {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('Update HTTP Status:', resUpdate.status, resUpdate.data);
  } catch(e) {
    console.error('API Error:', e.response ? e.response.data : e.message);
  }
}
run();
