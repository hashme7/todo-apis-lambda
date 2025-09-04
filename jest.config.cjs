module.exports = {
  testEnvironment: "node", // only keep .mjs
  testMatch: ["**/tests/**/*.test.js", "**/tests/**/*.test.mjs"],
  collectCoverageFrom: ["**/src/**/*.js"],
  coverageDirectory: "./coverage",
  coverageProvider: "v8",
  transform: {}, // disable Babel/esbuild\
  modulePathIgnorePatterns: [
      "<rootDir>/.aws-sam/", 
    "<rootDir>/node_modules/"
  ],
};
