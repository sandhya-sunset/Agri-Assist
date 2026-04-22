const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn(() => ({ sendMail: mockSendMail }));

jest.mock('nodemailer', () => ({
  createTransport: (...args) => mockCreateTransport(...args)
}));

const sendEmail = require('./sendEmail');

describe('sendEmail utility', () => {
  const originalEnv = process.env;
  let logSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    process.env = originalEnv;
  });

  test('logs a mock email when SMTP credentials are missing', async () => {
    delete process.env.SMTP_EMAIL;
    delete process.env.SMTP_PASSWORD;

    await sendEmail({
      email: 'user@example.com',
      subject: 'Hello',
      message: 'Test message'
    });

    expect(mockCreateTransport).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();
  });

  test('uses nodemailer when SMTP credentials exist', async () => {
    process.env.SMTP_EMAIL = 'smtp@example.com';
    process.env.SMTP_PASSWORD = 'secret';
    process.env.SMTP_SERVICE = 'gmail';
    process.env.FROM_NAME = 'AgriAssist';
    process.env.FROM_EMAIL = 'noreply@agriassist.com';

    mockSendMail.mockResolvedValue({ messageId: 'abc123' });

    await sendEmail({
      email: 'user@example.com',
      subject: 'Subject',
      message: 'Body'
    });

    expect(mockCreateTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'smtp@example.com',
        pass: 'secret'
      }
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'AgriAssist <noreply@agriassist.com>',
      to: 'user@example.com',
      subject: 'Subject',
      text: 'Body'
    });
  });
});
