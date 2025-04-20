const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
    "!**/tests/**",
  ],
  // Avoid watching too many files
  watchPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/coverage/",
    "<rootDir>/dist/",
    "<rootDir>/out/"
  ],

  // Disable watchman if you're still seeing watcher-related issues
  //watchman: false
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
async function jestConfig() {
  const nextJestConfig = await createJestConfig(customJestConfig)();
  // /node_modules/ is the first pattern
  nextJestConfig.transformIgnorePatterns[0] = "/node_modules/(?!(dateformat))/";
  return nextJestConfig;
}

module.exports = jestConfig;
