module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.unit.test.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/seedHomePage.js',
    '!src/seedRecommendation.js',
    '!src/test-*.js'
  ]
};
