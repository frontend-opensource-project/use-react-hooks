import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTranslation } from './useTranslation';
import { TranslationProvider } from '../context/TranslationContext';

const translations = {
  en: {
    greeting: 'Hello ${name}!',
  },
  ko: {
    greeting: '안녕 ${name}!',
  },
};

const TestComponent = () => {
  const { t, changeLanguage, language } = useTranslation();

  return (
    <div>
      <p data-testid="greeting">{t('greeting', { name: 'World' })}</p>
      <p data-testid="language">{language}</p>
      <button onClick={() => changeLanguage('ko')}>한국어로 변경</button>
    </div>
  );
};

describe('useTranslation hook', () => {
  test('설정한 defaultLanguage로 텍스트값이 렌더링되어야 함', () => {
    render(
      <TranslationProvider translations={translations} defaultLanguage="en">
        <TestComponent />
      </TranslationProvider>
    );

    expect(screen.getByTestId('greeting')).toHaveTextContent('Hello World');
    expect(screen.getByTestId('language')).toHaveTextContent('en');
  });

  test('changeLanguage 호출 시 전달한 언어로 텍스트가 변경되어야 함', async () => {
    render(
      <TranslationProvider translations={translations} defaultLanguage="en">
        <TestComponent />
      </TranslationProvider>
    );

    const button = screen.getByText('한국어로 변경');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('greeting')).toHaveTextContent('안녕 World');
      expect(screen.getByTestId('language')).toHaveTextContent('ko');
    });
  });
});
