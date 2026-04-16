const axios = require('axios');
const config = require('../config/config');

/**
 * Helper to get Khalti headers dynamically to ensure latest env values.
 */
const getKhaltiHeaders = () => ({
    Authorization: `Key ${config.khalti.secretKey}`,
    'Content-Type': 'application/json',
});

/**
 * Initiate Khalti e-Payment (v2).
 * Returns { pidx, payment_url, ... } from Khalti.
 */
const initiateKhaltiPayment = async ({ orderId, amount, customerName, customerEmail, customerPhone }) => {
    const body = {
        return_url: `${config.frontendUrl}/payment/khalti/callback/${orderId}`,
        website_url: config.frontendUrl,
        amount: amount, // in paisa (NPR * 100)
        purchase_order_id: orderId,
        purchase_order_name: `AgriAssist Order`,
        customer_info: {
            name: customerName || 'Customer',
            email: customerEmail || '',
            phone: customerPhone || '',
        },
    };

    try {
        const response = await axios.post(
            `${config.khalti.apiUrl}/epayment/initiate/`,
            body,
            { headers: getKhaltiHeaders() }
        );
        let data = response.data; // { pidx, payment_url, expires_at }
        
        // Fix for Khalti returning live URL in test environment
        if (config.khalti.apiUrl.includes('a.khalti.com') && data.payment_url) {
            data.payment_url = data.payment_url.replace('https://pay.khalti.com/', 'https://test-pay.khalti.com/');
        }
        
        return data;
    } catch (error) {
        console.error('Khalti Initiate Error Response:', error.response?.data);
        const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to initiate Khalti payment.';
        throw { statusCode: 400, message: msg };
    }
};

/**
 * Lookup / verify a Khalti e-Payment by pidx.
 * Returns { pidx, total_amount, status, transaction_id, ... }
 */
const lookupKhaltiPayment = async (pidx) => {
    try {
        const response = await axios.post(
            `${config.khalti.apiUrl}/epayment/lookup/`,
            { pidx },
            { headers: getKhaltiHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Khalti Lookup Error Response:', error.response?.data);
        const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to lookup Khalti payment.';
        throw { statusCode: 400, message: msg };
    }
};

module.exports = { initiateKhaltiPayment, lookupKhaltiPayment };