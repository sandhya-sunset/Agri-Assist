const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const secretKey = process.env.KHALTI_SECRET_KEY;
console.log("Using secret key:", secretKey);

async function test() {
  try {
    const res = await axios.post('https://khalti.com/api/v2/epayment/initiate/', {
        return_url: "http://localhost:5173/payment/khalti/callback/123",
        website_url: "http://localhost:5173",
        amount: 1000, 
        purchase_order_id: "123",
        purchase_order_name: "test",
        customer_info: { name: "test", email: "test@test.com", phone: "9800000000" }
    }, {
      headers: { Authorization: `Key ${secretKey}` }
    });
    console.log("https://khalti.com SUCCESS", res.data);
  } catch (e) {
    console.log("https://khalti.com ERROR", e.response?.data || e.message);
  }

  try {
    const res2 = await axios.post('https://a.khalti.com/api/v2/epayment/initiate/', {
        return_url: "http://localhost:5173/payment/khalti/callback/123",
        website_url: "http://localhost:5173",
        amount: 1000, 
        purchase_order_id: "123",
        purchase_order_name: "test",
        customer_info: { name: "test", email: "test@test.com", phone: "9800000000" }
    }, {
      headers: { Authorization: `Key ${secretKey}` }
    });
    console.log("https://a.khalti.com SUCCESS", res2.data);
  } catch (e) {
    console.log("https://a.khalti.com ERROR", e.response?.data || e.message);
  }
}

test();
