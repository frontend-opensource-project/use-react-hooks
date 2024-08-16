export const isClient = typeof window !== 'undefined';

export const hasNavigator = () => {
  return isClient && typeof navigator !== 'undefined';
};
