/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/integration/jest-env.js'],
  globals: {
    'ts-jest': {
      tsconfig: 'integration/tsconfig.json',
    },
  },
};
