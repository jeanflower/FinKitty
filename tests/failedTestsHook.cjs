/**
 * Records each failing test to testResults/failedTests/ — runs inside every test worker,
 * including Jest watch mode (custom reporters often do not run there).
 * Removes dumps when the same test passes again.
 */
const { expect, it: jestIt, test: jestTest } = require("@jest/globals");
const {
  recordFailedTestFromExpectState,
  removeFailedTestFromExpectState,
} = require("../scripts/record-failed-test");

function wrapTestDeclarer(original) {
  return function failedTestsWrappedDeclarer(name, fn, timeout) {
    if (typeof fn !== "function") {
      return original(name, fn, timeout);
    }
    const wrapped = async (...args) => {
      try {
        const result = await fn(...args);
        removeFailedTestFromExpectState(expect.getState());
        return result;
      } catch (error) {
        recordFailedTestFromExpectState({
          ...expect.getState(),
          error,
        });
        throw error;
      }
    };
    return original(name, wrapped, timeout);
  };
}

const wrap = wrapTestDeclarer;
global.it = wrap(global.it);
global.test = wrap(global.test);
require("@jest/globals").it = wrap(jestIt);
require("@jest/globals").test = wrap(jestTest);
