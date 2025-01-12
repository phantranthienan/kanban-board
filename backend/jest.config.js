/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": ["ts-jest", {}], // Only match `.ts` files
  },
  moduleDirectories: ["node_modules", "src"], // Ensure Jest looks in the `src` directory
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.spec.ts"], // Detect test files in `tests` folder
  coverageDirectory: "coverage", // Store coverage reports in `coverage` folder
  collectCoverage: true, // Enable test coverage
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/index.ts", // Exclude index files
    "!src/**/*.d.ts" // Exclude type declaration files
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/setup/setupTests.ts"], // Optional global setup
  verbose: true, // Show detailed test logs
  clearMocks: true, // Automatically clear mocks between tests
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Map `@/` to `src/` directory
  },
};
