jest.mock('axios', () => ({
  post: jest.fn()
}));

describe('payment utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      KHALTI_SECRET_KEY: 'test_secret',
      KHALTI_API_URL: 'https://a.khalti.com/api/v2',
      FRONTEND_URL: 'http://localhost:5173'
    };
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('initiateKhaltiPayment rewrites payment URL in test environment', async () => {
    const axios = require('axios');
    axios.post.mockResolvedValue({
      data: {
        pidx: 'pidx_1',
        payment_url: 'https://pay.khalti.com/?pidx=pidx_1'
      }
    });

    const { initiateKhaltiPayment } = require('./payment');

    const result = await initiateKhaltiPayment({
      orderId: 'order-1',
      amount: 1000,
      customerName: 'User',
      customerEmail: 'u@example.com',
      customerPhone: '9800000000'
    });

    expect(axios.post).toHaveBeenCalled();
    expect(result.payment_url).toContain('https://test-pay.khalti.com/');
  });

  test('lookupKhaltiPayment returns lookup response payload', async () => {
    const axios = require('axios');
    axios.post.mockResolvedValue({
      data: {
        pidx: 'pidx_2',
        status: 'Completed'
      }
    });

    const { lookupKhaltiPayment } = require('./payment');
    const result = await lookupKhaltiPayment('pidx_2');

    expect(result).toEqual({ pidx: 'pidx_2', status: 'Completed' });
  });

  test('initiateKhaltiPayment throws normalized error on failure', async () => {
    const axios = require('axios');
    axios.post.mockRejectedValue({
      response: {
        data: {
          detail: 'Bad request'
        }
      }
    });

    const { initiateKhaltiPayment } = require('./payment');

    await expect(
      initiateKhaltiPayment({ orderId: 'order-2', amount: 500 })
    ).rejects.toEqual({ statusCode: 400, message: 'Bad request' });
  });
});
