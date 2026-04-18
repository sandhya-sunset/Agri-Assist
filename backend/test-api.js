const axios = require('axios');
async function run() {
  try {
    const res1 = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@agri.com',
      password: 'newpw123'
    });
    console.log('Login:', res1.data.success);
    const token = res1.data.token;
    
    try {
      const res2 = await axios.put('http://localhost:5000/api/auth/update-password', {
        currentPassword: 'newpw123',
        newPassword: 'newer1234'
      }, {
        headers: { Authorization: 'Bearer ' + token }
      });
      console.log('Update:', res2.data);
    } catch(e) {
      console.error('Update error:', e.response.data);
    }
  } catch(e) {
    console.error('Login error:', e.response ? e.response.data : e.message);
  }
}
run();
