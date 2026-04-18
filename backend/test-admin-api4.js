const axios = require('axios');
async function run() {
  try {
    console.log('Starting login...');
    let resAuth = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sandhyamajhi77@gmail.com',
      password: 'admin1234!!'
    });
    console.log('Login with new pw success:', resAuth.data.success);
  } catch(e) {
    console.error('API Error:', e.response ? e.response.data : e.message);
  }
}
run();
