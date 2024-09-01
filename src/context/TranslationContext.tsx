import { createContext, useState } from 'react';

type Translations = {
  [key: string]: string;
};

type TranslationsMap = {
  [language: string]: Translations;
};

interface TranslationContextProps {
  language: string;
  changeLanguage: (lang: string) => void;
  currentTranslations: TranslationsMap[string];
}

interface TranslationProviderProps {
  children: React.ReactNode;
  translations: TranslationsMap;
  defaultLanguage: string;
}

export const TranslationContext = createContext<TranslationContextProps | null>(
  null
);

/**
 * @param children useTranslation을 사용할 자식 컴포넌트
 * @param defaultLanguage 디폴트 언어 키값
 * @param translations 키값과 변역 텍스트가 매핑된 객체 (동적인 값을 넣어야 하는 경우 ${key} 형식으로 넣어야 함)
 */
export const TranslationProvider = ({
  children,
  translations,
  defaultLanguage,
}: TranslationProviderProps) => {
  const [language, setLanguage] = useState<string>(defaultLanguage);
  const [currentTranslations, setCurrentTranslations] = useState<Translations>(
    translations[defaultLanguage] || {}
  );

  const changeLanguage = (language: string) => {
    setLanguage(language);
    setCurrentTranslations(translations[language] || {});
  };

  return (
    <TranslationContext.Provider
      value={{ language, changeLanguage, currentTranslations }}>
      {children}
    </TranslationContext.Provider>
  );
};
