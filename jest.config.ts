import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  verbose: true,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  setupFiles: ['jest-canvas-mock', './src/mocks/mockWorker.ts'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  coveragePathIgnorePatterns: ['./src/mocks/'],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};

export default config;
