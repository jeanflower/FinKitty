const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "<rootDir>/tests/failedTestsHook.cjs",
  ],
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

const {
  isTruthyEnv,
  applyRebaselineScopeToConfig,
} = require("./scripts/apply-rebaseline-jest-scope");

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
async function jestConfig() {
  const nextJestConfig = await createJestConfig(customJestConfig)();
  // /node_modules/ is the first pattern
  nextJestConfig.transformIgnorePatterns[0] = "/node_modules/(?!(dateformat))/";
  if (isTruthyEnv(process.env.FINKITTY_JEST_ONLY_REBASELINE_TARGETS)) {
    const scope = applyRebaselineScopeToConfig(nextJestConfig);
    if (scope.applied) {
      // eslint-disable-next-line no-console
      console.warn(
        `[jest] REBASELINE TARGETS SCOPE: ${scope.targets.length} test(s) in ${scope.files.length} file(s) — press Enter to re-run; do NOT press 'a' (runs full suite)`,
      );
      for (const t of scope.targets) {
        // eslint-disable-next-line no-console
        console.warn(`  ${t.file} :: ${t.name}`);
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `[jest] FINKITTY_JEST_ONLY_REBASELINE_TARGETS set but ${require("./scripts/apply-rebaseline-jest-scope").rebaselineTargetsDisplayPath()} is empty — running full suite`,
      );
    }
  }
  return nextJestConfig;
}

module.exports = jestConfig;
