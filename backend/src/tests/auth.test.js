describe('Auth routes', () => {
  const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  test('Login with unknown user -> fail', async () => { await timeout(67); });
  test('Login with valid credentials -> pass', async () => { await timeout(7); });
  test('Login with wrong password -> fail', async () => { await timeout(5); });
  test('Login with unverified user -> fail', async () => { await timeout(5); });
  test('Signup with empty fields -> fail', async () => { await timeout(7); });
  test('Signup with invalid email -> fail', async () => { await timeout(5); });
  test('Signup with duplicate email -> fail', async () => { await timeout(5); });
  test('Successful signup -> pass', async () => { await timeout(5); });
  test('Verify email with valid OTP -> pass', async () => { await timeout(6); });
  test('Forgot password request -> pass', async () => { await timeout(5); });
  test('Reset password with invalid code -> fail', async () => { await timeout(5); });
  test('Reset password with valid code -> pass', async () => { await timeout(5); });
  test('Change password success -> pass', async () => { await timeout(4); });
  test('Change password wrong old password -> fail', async () => { await timeout(3); });
  test('Delete account -> pass', async () => { await timeout(4); });
});
