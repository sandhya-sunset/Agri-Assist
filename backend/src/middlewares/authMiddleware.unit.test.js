jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

jest.mock('../models/User', () => ({
  findById: jest.fn()
}));

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, admin, seller } = require('./authMiddleware');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('authMiddleware.protect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  test('returns 401 when no token is provided', async () => {
    const req = { headers: {} };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized, no token'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when token verification fails', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const req = { headers: { authorization: 'Bearer badtoken' } };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized, token failed'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when decoded user is not found', async () => {
    jwt.verify.mockReturnValue({ id: 'user123' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const req = { headers: { authorization: 'Bearer token123' } };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User not found'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('sets req.user and calls next when token is valid', async () => {
    const user = { _id: 'user123', role: 'user' };
    jwt.verify.mockReturnValue({ id: 'user123' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(user)
    });

    const req = { headers: { authorization: 'Bearer token123' } };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('authMiddleware role guards', () => {
  test('admin allows admin role', () => {
    const req = { user: { role: 'admin' } };
    const res = createRes();
    const next = jest.fn();

    admin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('admin rejects non-admin role', () => {
    const req = { user: { role: 'user' } };
    const res = createRes();
    const next = jest.fn();

    admin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('seller allows seller and admin roles', () => {
    const req = { user: { role: 'seller' } };
    const res = createRes();
    const next = jest.fn();

    seller(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
