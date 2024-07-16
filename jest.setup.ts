import '@testing-library/jest-dom/jest-globals';
import { cleanup } from '@testing-library/react';

beforeAll(() => {
  console.log('🌟 Running setup before all tests...');
});

afterAll(() => {
  console.log('🔚 Running teardown after all tests...');
  cleanup();
});
