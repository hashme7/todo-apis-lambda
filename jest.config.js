module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["**/src/**/*.js"],
  coverageDirectory: "./coverage",
  coverageProvider: "v8",
  transform: {},
  modulePathIgnorePatterns: [
    "<rootDir>/.aws-sam/", 
    "<rootDir>/node_modules/"
  ],
};