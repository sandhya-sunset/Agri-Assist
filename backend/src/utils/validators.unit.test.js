const mockValidationResult = jest.fn();

jest.mock('express-validator', () => {
  const createChain = () => {
    const chain = {};
    chain.trim = jest.fn(() => chain);
    chain.notEmpty = jest.fn(() => chain);
    chain.withMessage = jest.fn(() => chain);
    chain.isLength = jest.fn(() => chain);
    chain.isEmail = jest.fn(() => chain);
    chain.custom = jest.fn(() => chain);
    chain.isIn = jest.fn(() => chain);
    return chain;
  };

  return {
    body: jest.fn(() => createChain()),
    validationResult: (...args) => mockValidationResult(...args)
  };
});

const {
  validateRegister,
  validateLogin,
  handleValidationErrors
} = require('./validators');

describe('validators utility', () => {
  beforeEach(() => {
    mockValidationResult.mockReset();
  });

  test('exports register/login validator chains', () => {
    expect(Array.isArray(validateRegister)).toBe(true);
    expect(Array.isArray(validateLogin)).toBe(true);
    expect(validateRegister.length).toBeGreaterThan(0);
    expect(validateLogin.length).toBeGreaterThan(0);
  });

  test('handleValidationErrors calls next when no errors exist', () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    mockValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });

    handleValidationErrors(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('handleValidationErrors returns 400 with mapped errors', () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    mockValidationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [
        { path: 'email', msg: 'Email is required' },
        { path: 'password', msg: 'Password is required' }
      ]
    });

    handleValidationErrors(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password is required' }
      ]
    });
    expect(next).not.toHaveBeenCalled();
  });
});
